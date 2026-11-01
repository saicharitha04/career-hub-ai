import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Ideas the signed-in user saved from the Idea Generator, newest first. */
export const listOwn = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const ideas = await ctx.db
      .query("savedIdeas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return ideas.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Save a generated idea to the user's collection. */
export const save = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    problem: v.string(),
    domain: v.string(),
    difficulty: v.string(),
    technologies: v.array(v.string()),
    features: v.array(v.string()),
    approach: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    if (!args.title.trim()) throw new Error("Idea needs a title");

    const existing = await ctx.db
      .query("savedIdeas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.some((idea) => idea.title === args.title)) {
      throw new Error("You've already saved this idea");
    }

    await ctx.db.insert("savedIdeas", {
      userId,
      title: args.title.trim(),
      description: args.description,
      problem: args.problem,
      domain: args.domain,
      difficulty: args.difficulty,
      technologies: args.technologies,
      features: args.features,
      approach: args.approach,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { ideaId: v.id("savedIdeas") },
  handler: async (ctx, { ideaId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const idea = await ctx.db.get(ideaId);
    if (!idea || idea.userId !== userId) throw new Error("Idea not found");
    await ctx.db.delete(ideaId);
  },
});
