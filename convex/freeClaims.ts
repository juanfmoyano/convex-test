import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const HOME_USER_ID: Id<"users"> =
  "jx7cxfzs031yk7mdymghdvbqys7jgfzv" as Id<"users">;
const DAILY_TOKEN_AMOUNT = 100;

export const claimDailyTokens = mutation({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser, {});
    await ctx.db.insert("freeClaims", {
      user_id: user._id,
      amount: DAILY_TOKEN_AMOUNT,
    });
    await ctx.runMutation(internal.transactions.createTransaction, {
			sourceUsersId: HOME_USER_ID,
      targetUserId: user._id,
      amount: DAILY_TOKEN_AMOUNT,
      description: `${new Date().toISOString()} - ${DAILY_TOKEN_AMOUNT} - Daily Claim`,
    });
  },
});

export const getAllClaims = query({
  handler: async (ctx) => {
    return await ctx.db.query("freeClaims").collect();
  },
});