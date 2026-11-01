import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Choose which side of HIKEHIVE the signed-in user works on. Runs once after
 * first sign-in (see /role), and can be revisited from the account menu.
 * The optional name is stored on the user record for display everywhere.
 */
export const setRole = mutation({
  args: {
    role: v.union(
      v.literal("student"),
      v.literal("recruiter"),
      v.literal("admin"),
    ),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const patch: { role: "student" | "recruiter" | "admin"; name?: string } = {
      role: args.role,
    };
    const name = args.name?.trim();
    if (name) patch.name = name;
    await ctx.db.patch(userId, patch);
  },
});
