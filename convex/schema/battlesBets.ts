import { TableAggregate } from "@convex-dev/aggregate";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { DataModel } from "../_generated/dataModel";
import { components } from "../_generated/api";

export const outgoingBetsAggregate = new TableAggregate<{
	Key: string; 
	DataModel: DataModel;
	TableName: "battlesBets";
}>(components.battlesBetsAggregate, {
	sortKey: (doc) => doc.user_id,
	sumValue: (doc) => doc.amount,
});

export const battlesBetsTable = defineTable({
  user_id: v.id("users"),
  battle_id: v.id("battles"),
  amount: v.number(),
})
  .index("byUser", ["user_id"])
  .index("byBattle", ["battle_id"]);
