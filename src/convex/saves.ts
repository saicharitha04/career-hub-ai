import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** The signed-in student's saved opportunities, joined with each listing. */
export const listByStudent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const saves = await ctx.db
      .query("saved")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .collect();

    const joined = [];
    for (const save of saves) {
      const opportunity = await ctx.db.get(save.opportunityId);
      if (opportunity) joined.push({ ...save, opportunity });
    }
    return joined.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Bookmark an opportunity, or remove the bookmark if it already exists. */
export const toggle = mutation({
  args: { opportunityId: v.id("opportunities") },
  handler: async (ctx, { opportunityId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("saved")
      .withIndex("by_student_opportunity", (q) =>
        q.eq("studentId", userId).eq("opportunityId", opportunityId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("saved", {
      opportunityId,
      studentId: userId,
      createdAt: Date.now(),
    });
    return true;
  },
});
