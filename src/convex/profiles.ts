import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** The signed-in user's profile document (created on first save). */
export const getOwn = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

/** Create or update the signed-in user's profile. */
export const upsert = mutation({
  args: {
    headline: v.optional(v.string()),
    phone: v.optional(v.string()),
    education: v.optional(v.string()),
    graduationYear: v.optional(v.string()),
    skills: v.array(v.string()),
    interests: v.array(v.string()),
    goals: v.optional(v.string()),
    // The resume upload itself is stored in Convex file storage; this
    // mutation records the metadata alongside the profile.
    resumeName: v.optional(v.string()),
    resumeSize: v.optional(v.number()),
    resumeStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const clean = (s: string | undefined) => s?.trim();
    const list = (values: string[]) =>
      [...new Set(values.map((s) => s.trim()).filter(Boolean))];

    const payload = {
      headline: clean(args.headline) || undefined,
      phone: clean(args.phone) || undefined,
      education: clean(args.education) || undefined,
      graduationYear: clean(args.graduationYear) || undefined,
      skills: list(args.skills),
      interests: list(args.interests),
      goals: clean(args.goals) || undefined,
      resumeName: args.resumeName,
      resumeSize: args.resumeSize,
      resumeStorageId: args.resumeStorageId,
      updatedAt: Date.now(),
    };

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("profiles", { userId, ...payload });
    }
  },
});

