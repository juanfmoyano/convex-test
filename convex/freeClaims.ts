import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
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
			sourceUserId: HOME_USER_ID,
      targetUserId: user._id,
      amount: DAILY_TOKEN_AMOUNT,
      description: `Daily Claim`,
    });
  },
});
