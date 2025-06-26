import z from "zod";
import {
  internalMutationWithZod,
  mutationWithZod,
  queryWithZod,
  zId,
} from "./utils";
import {
  BATTLE_MOVES,
  BATTLE_STATUS,
  BattleMove,
  battleMovesSchema,
} from "./schema/battles";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

type OpenBattleWithoutCreatorMove = Omit<Doc<"battles">, "creator_move">;
export type OpenBattle = OpenBattleWithoutCreatorMove & {
  creatorUser: Doc<"users">;
  isOwnBattle: boolean;
  canParticipate: boolean;
};

export type FinishedBattle = Doc<"battles"> & {
  creatorUser: Doc<"users">;
  joinerUser: Doc<"users">;
  winnerUser?: Doc<"users">;
};

const BEATS: { [key in BattleMove]: BattleMove } = {
  [BATTLE_MOVES.ROCK]: BATTLE_MOVES.SCISSORS,
  [BATTLE_MOVES.PAPER]: BATTLE_MOVES.ROCK,
  [BATTLE_MOVES.SCISSORS]: BATTLE_MOVES.PAPER,
};

export const createBattle = mutationWithZod({
  args: {
    betAmount: z.number().min(1, "Bet amount must be greater than 0"),
    creatorMove: battleMovesSchema,
  },
  handler: async (ctx, args) => {
    const userBalance = await ctx.runQuery(api.transactions.getUserBalance, {});
    if (userBalance < args.betAmount) {
      throw new Error("Insufficient balance to create a battle");
    }
    const creatorUser = await ctx.runQuery(internal.users.getCurrentUser, {});
    const createdBattleId = await ctx.db.insert("battles", {
      creator_user_id: creatorUser._id,
      bet_amount: args.betAmount,
      creator_move: args.creatorMove,
      status: BATTLE_STATUS.OPEN,
    });
    await ctx.runMutation(internal.battleBets.createBattleBet, {
      user_id: creatorUser._id,
      battle_id: createdBattleId,
    });
  },
});

export const resolveBattle = internalMutationWithZod({
  args: {
    battleId: zId("battles"),
  },
  handler: async (ctx, args) => {
    const battle = await ctx.db.get(args.battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }
    if (battle.status !== BATTLE_STATUS.ONGOING) {
      throw new Error("Battle is not ongoing");
    }
    if (!battle.joiner_user_id) {
      throw new Error("Battle must have a joiner user");
    }
    if (!battle.creator_move || !battle.joiner_move) {
      throw new Error("Both players must have made a move");
    }

    const isDraw = battle.creator_move === battle.joiner_move;
    if (isDraw) {
      await ctx.db.patch(args.battleId, {
        status: BATTLE_STATUS.COMPLETED,
      });
    } else {
      const creatorWon = BEATS[battle.creator_move] === battle.joiner_move;
      const joinerWon = BEATS[battle.joiner_move] === battle.creator_move;
      if ((!creatorWon && !joinerWon) || (creatorWon && joinerWon)) {
        throw new Error("Battle winner is not valid");
      }
      await ctx.runMutation(internal.transactions.createTransaction, {
        sourceUserId: creatorWon
          ? battle.joiner_user_id
          : battle.creator_user_id,
        targetUserId: creatorWon
          ? battle.creator_user_id
          : battle.joiner_user_id,
        amount: battle.bet_amount,
        description: `Battle win - ${creatorWon ? "creator" : "joiner"}`,
      });
      await ctx.db.patch(args.battleId, {
        status: BATTLE_STATUS.COMPLETED,
        winner_user_id: creatorWon
          ? battle.creator_user_id
          : battle.joiner_user_id,
      });
    }

    await ctx.runMutation(internal.battleBets.deleteBattleBets, {
      battleId: args.battleId,
      creatorUserId: battle.creator_user_id,
      joinerUserId: battle.joiner_user_id,
    });
  },
});

export const joinBattle = mutationWithZod({
  args: {
    battleId: zId("battles"),
    joinerMove: battleMovesSchema,
  },
  handler: async (ctx, args) => {
    const joinerUser = await ctx.runQuery(internal.users.getCurrentUser, {});
    const battle = await ctx.db.get(args.battleId);

    if (!battle) {
      throw new Error("Battle not found");
    }
    if (battle.status !== BATTLE_STATUS.OPEN) {
      throw new Error("Battle is not open for joining");
    }
    if (battle.joiner_user_id || battle.joiner_move) {
      throw new Error("Battle already has a joiner");
    }
    if (battle.creator_user_id === joinerUser._id) {
      throw new Error("You cannot join your own battle");
    }
    const userBalance = await ctx.runQuery(api.transactions.getUserBalance, {});
    if (userBalance < battle.bet_amount) {
      throw new Error("Insufficient balance to create a battle");
    }
    await ctx.db.patch(args.battleId, {
      joiner_user_id: joinerUser._id,
      joiner_move: args.joinerMove,
      status: BATTLE_STATUS.ONGOING,
    });
    await ctx.runMutation(internal.battleBets.createBattleBet, {
      user_id: joinerUser._id,
      battle_id: battle._id,
    });
    await ctx.scheduler.runAfter(3000, internal.battles.resolveBattle, {
      battleId: args.battleId,
    });
  },
});

export const getOpenBattles = queryWithZod({
  args: {
    limit: z
      .number()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit must be at most 100"),
  },
  handler: async (ctx, args): Promise<OpenBattle[]> => {
    const battles = await ctx.db
      .query("battles")
      .withIndex("byStatus", (q) => q.eq("status", BATTLE_STATUS.OPEN))
      .filter((q) =>
        q.and(
          q.eq(q.field("winner_user_id"), undefined),
          q.eq(q.field("joiner_user_id"), undefined),
          q.eq(q.field("joiner_move"), undefined)
        )
      )
      .order("desc")
      .take(args.limit);
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser, {});
    const currentUserBalance = await ctx.runQuery(
      api.transactions.getUserBalance,
      {}
    );
    const battlesWithUsers: OpenBattle[] = await Promise.all(
      battles.map(async (battle) => {
        const creatorUser = await ctx.db.get(battle.creator_user_id);
        const isOwnBattle = battle.creator_user_id === currentUser._id;
        const canParticipate = battle.bet_amount <= currentUserBalance;
        if (!creatorUser) {
          throw new Error("Creator user not found");
        }
        return {
          ...battle,
          creatorUser,
          isOwnBattle,
          canParticipate,
        };
      })
    );
    return battlesWithUsers;
  },
});

export const getFinishedBattles = queryWithZod({
  args: {
    limit: z
      .number()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit must be at most 100"),
  },
  handler: async (ctx, args): Promise<FinishedBattle[]> => {
    const battles = await ctx.db
      .query("battles")
      .withIndex("byStatus", (q) => q.eq("status", BATTLE_STATUS.COMPLETED))
      .filter((q) =>
        q.and(
          q.neq(q.field("joiner_user_id"), undefined),
          q.neq(q.field("joiner_move"), undefined)
        )
      )
      .order("desc")
      .take(args.limit);
    const battlesWithUsers: FinishedBattle[] = await Promise.all(
      battles.map(async (battle) => {
        const creatorUser = await ctx.db.get(battle.creator_user_id);
        if (!creatorUser) {
          throw new Error("Creator user not found");
        }
        const joinerUser = battle.joiner_user_id
          ? await ctx.db.get(battle.joiner_user_id)
          : null;
        if (!joinerUser) {
          throw new Error("Joiner user not found");
        }
        if (!battle.joiner_move) throw new Error("Joiner move not found");
        const creatorWon = battle.winner_user_id === battle.creator_user_id;
        const joinerWon = battle.winner_user_id === battle.joiner_user_id;

        let winnerUser: Doc<"users"> | undefined;
        if (creatorWon) winnerUser = creatorUser;
        if (joinerWon) winnerUser = joinerUser;
        return {
          ...battle,
          creatorUser,
          joinerUser,
          winnerUser,
        };
      })
    );
    return battlesWithUsers;
  },
});
