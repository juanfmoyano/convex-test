import { defineTable } from "convex/server";
import { v } from "convex/values";
import z from "zod";

export const BATTLE_MOVES = {
  ROCK: "BATTLE_MOVE_ROCK",
  PAPER: "BATTLE_MOVE_PAPER",
  SCISSORS: "BATTLE_MOVE_SCISSORS",
} as const;
export const battleMovesSchema = z.enum([
	BATTLE_MOVES.ROCK,
	BATTLE_MOVES.PAPER,
	BATTLE_MOVES.SCISSORS,
])
export type BattleMove = (typeof BATTLE_MOVES)[keyof typeof BATTLE_MOVES];

export const BATTLE_STATUS = {
  CANCELLED: "BATTLE_STATUS_CANCELLED",
  OPEN: "BATTLE_STATUS_OPEN",
  ONGOING: "BATTLE_STATUS_ONGOING",
  COMPLETED: "BATTLE_STATUS_COMPLETED",
} as const;
export const battleStatusSchema = z.enum([
	BATTLE_STATUS.CANCELLED,
	BATTLE_STATUS.OPEN,
	BATTLE_STATUS.ONGOING,
	BATTLE_STATUS.COMPLETED,
])
export type BattleState = (typeof BATTLE_STATUS)[keyof typeof BATTLE_STATUS];

export const battlesTable = defineTable({
  creator_user_id: v.id("users"),
  joiner_user_id: v.optional(v.id("users")),
  creator_move: v.union(
    v.literal(BATTLE_MOVES.PAPER),
    v.literal(BATTLE_MOVES.ROCK),
    v.literal(BATTLE_MOVES.SCISSORS)
  ),
  joiner_move: v.optional(
    v.union(
      v.literal(BATTLE_MOVES.PAPER),
      v.literal(BATTLE_MOVES.ROCK),
      v.literal(BATTLE_MOVES.SCISSORS)
    )
  ),
  bet_amount: v.number(),
  status: v.union(
    v.literal(BATTLE_STATUS.CANCELLED),
    v.literal(BATTLE_STATUS.OPEN),
    v.literal(BATTLE_STATUS.ONGOING),
    v.literal(BATTLE_STATUS.COMPLETED)
  ),
  winner_user_id: v.optional(v.id("users")),
  resolved_at: v.optional(v.number()),
})
  .index("byCreator", ["creator_user_id"])
  .index("byJoiner", ["joiner_user_id"])
  .index("byWinner", ["winner_user_id"])
  .index("byStatus", ["status"]);
