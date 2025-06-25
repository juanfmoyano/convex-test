import { defineTable } from "convex/server";
import { v } from "convex/values";

export const transactionsTable = defineTable({
  source_user_id: v.id("users"),
  target_user_id: v.id("users"),
  amount: v.number(),
  description: v.optional(v.string()),
})
  .index("bySource", ["source_user_id"])
  .index("byTarget", ["target_user_id"]);
