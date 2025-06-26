import { TableAggregate } from "@convex-dev/aggregate";
import { z } from "zod";
import { query } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { DataModel, Doc, Id } from "./_generated/dataModel";
import { internalMutationWithZod, zId } from "./utils";
import { outgoingBetsAggregate } from "./schema/battlesBets";

const incomingAggregate = new TableAggregate<{
  Key: string;
  DataModel: DataModel;
  TableName: "transactions";
}>(components.incomingAggregate, {
  sortKey: (doc) => doc.target_user_id,
  sumValue: (doc) => doc.amount,
});

const outgoingAggregate = new TableAggregate<{
  Key: string;
  DataModel: DataModel;
  TableName: "transactions";
}>(components.outgoingAggregate, {
  sortKey: (doc) => doc.source_user_id,
  sumValue: (doc) => doc.amount,
});

export const createTransaction = internalMutationWithZod({
  args: {
    sourceUserId: zId("users"),
    targetUserId: zId("users"),
    amount: z.number().min(1, "Transaction amount must be greater than 0"),
    description: z.string().optional(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("transactions", {
      source_user_id: args.sourceUserId,
      target_user_id: args.targetUserId,
      amount: args.amount,
      description: args.description,
    });
    const doc = await ctx.db.get(id);
    await incomingAggregate.insert(ctx, doc!);
    await outgoingAggregate.insert(ctx, doc!);
  },
});

export const getAllTransactions = query({
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("transactions")
      .order("desc")
      .collect();

    const userIdsSet = new Set<Id<"users">>();
    for (const tx of transactions) {
      userIdsSet.add(tx.source_user_id);
      userIdsSet.add(tx.target_user_id);
    }

    const userIds = Array.from(userIdsSet);

    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

    const userMap = new Map<Id<"users">, Doc<"users">>();
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const userDoc = users[i];
      if (userDoc) {
        userMap.set(userId, userDoc);
      }
    }

    const populatedTransactions = transactions.map((tx) => {
      const sourceUser = userMap.get(tx.source_user_id);
      const targetUser = userMap.get(tx.target_user_id);
      if (!sourceUser) {
        throw new Error(
          `Source user not found for transaction ${tx._id} -> ${tx.source_user_id}`
        );
      }
      if (!targetUser) {
        throw new Error(
          `Target user not found for transaction ${tx._id} -> ${tx.target_user_id}`
        );
      }
      return {
        ...tx,
        sourceUser: sourceUser,
        targetUser: targetUser,
      };
    });

    return populatedTransactions;
  },
});

export const getUserBalance = query({
  handler: async (ctx) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser, {});
    const bounds = {
      lower: { key: currentUser._id, inclusive: true },
      upper: { key: currentUser._id, inclusive: true },
    };
    const incoming = await incomingAggregate.sum(ctx, { bounds });
    const outgoing = await outgoingAggregate.sum(ctx, { bounds });
    const outgoingBets = await outgoingBetsAggregate.sum(ctx, { bounds });
    return (incoming ?? 0) - (outgoing ?? 0) - (outgoingBets ?? 0);
  },
});
