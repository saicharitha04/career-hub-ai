import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Questions and comments on a listing, oldest first, with author labels.
 *  The arg is optional so a malformed URL doesn't fail validation. */
export const listByOpportunity = query({
  args: { opportunityId: v.optional(v.id("opportunities")) },
  handler: async (ctx, { opportunityId }) => {
    if (opportunityId === undefined) return [];
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_opportunity", (q) => q.eq("opportunityId", opportunityId))
      .collect();

    const joined = [];
    for (const comment of comments) {
      const author = await ctx.db.get(comment.userId);
      joined.push({
        ...comment,
        authorName:
          author?.name?.trim() || author?.email?.split("@")[0] || "Team member",
      });
    }
    return joined.sort((a, b) => a.createdAt - b.createdAt);
  },
});

/** Post a comment on a listing. */
export const add = mutation({
  args: { opportunityId: v.id("opportunities"), body: v.string() },
  handler: async (ctx, { opportunityId, body }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const text = body.trim();
    if (!text) throw new Error("Write something before posting");
    if (text.length > 1000) throw new Error("Keep comments under 1,000 characters");

    const opportunity = await ctx.db.get(opportunityId);
    if (!opportunity) throw new Error("Opportunity not found");

    await ctx.db.insert("comments", {
      opportunityId,
      userId,
      body: text,
      createdAt: Date.now(),
    });
  },
});
