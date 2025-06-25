import { defineTable } from "convex/server";
import { v } from "convex/values";

export const freeClaimsTable = defineTable({
  user_id: v.id("users"),
  amount: v.number(),
}).index("byUser", ["user_id"]);
