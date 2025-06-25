import { Id } from "./_generated/dataModel";
import { internalQueryWithZod } from "./utils";

export const getCurrentUser = internalQueryWithZod({
  handler: async (ctx) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) {
      throw new Error("User not authenticated");
    }

    const userId = userIdentity.subject.split("|")[0];
		if (!userId) {
			throw new Error("User ID not found in identity");
		}

    const user = await ctx.db.get(userId as Id<"users">);
		if (!user) {
			throw new Error("User not found in database");
		}
    return user;
  },
});
