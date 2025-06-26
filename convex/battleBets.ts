import { outgoingBetsAggregate } from "./schema/battlesBets";
import { internalMutationWithZod, zId } from "./utils";

export const createBattleBet = internalMutationWithZod({
  args: {
    user_id: zId("users"),
    battle_id: zId("battles"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const battle = await ctx.db.get(args.battle_id);
    if (!battle) {
      throw new Error("Battle not found");
    }

    const createdBattleBetId = await ctx.db.insert("battlesBets", {
      user_id: args.user_id,
      battle_id: args.battle_id,
      amount: battle.bet_amount,
    });
    const createdBattleBet = await ctx.db.get(createdBattleBetId);

    await outgoingBetsAggregate.insert(ctx, createdBattleBet!);
  },
});

export const deleteBattleBets = internalMutationWithZod({
  args: {
    creatorUserId: zId("users"),
    joinerUserId: zId("users"),
    battleId: zId("battles"),
  },
  handler: async (ctx, args) => {
    const battleBets = await ctx.db
      .query("battlesBets")
      .withIndex("byBattle", (q) => q.eq("battle_id", args.battleId))
      .filter((q) =>
        q.or(
          q.eq(q.field("user_id"), args.creatorUserId),
          q.eq(q.field("user_id"), args.joinerUserId)
        )
      )
      .collect();

    if (battleBets.length === 0) {
      throw new Error("No bets found for the specified users and battle");
    }

    if (battleBets.length !== 2) {
      throw new Error(
        "There should be exactly two bets for the creator and joiner"
      );
    }

    await ctx.db.delete(battleBets[0]._id);
    await ctx.db.delete(battleBets[1]._id);
    await outgoingBetsAggregate.delete(ctx, battleBets[0]);
    await outgoingBetsAggregate.delete(ctx, battleBets[1]);
  },
});
