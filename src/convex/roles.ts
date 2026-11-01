import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Choose which side of HIKEHIVE the signed-in user works on. Runs once after
 * first sign-in (see /role) and can be revisited from the account menu.
 */
export const setRole = mutation({
  args: {
    role: v.union(v.literal("student"), v.literal("recruiter")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { role: args.role });
  },
});
