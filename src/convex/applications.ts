import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { applicationStatusValidator, ROLES } from "./schema";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  return userId;
}

/**
 * The signed-in student's applications, newest first, each joined with its
 * opportunity so the UI renders in a single round trip.
 */
export const listByStudent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .collect();

    const joined = [];
    for (const application of applications) {
      const opportunity = await ctx.db.get(application.opportunityId);
      if (opportunity) joined.push({ ...application, opportunity });
    }
    return joined.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Every application to the signed-in recruiter's opportunities, with the
 * student profile and the opportunity it belongs to.
 */
export const listForRecruiter = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.RECRUITER) return [];

    const opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();

    const joined = [];
    for (const opportunity of opportunities) {
      const applications = await ctx.db
        .query("applications")
        .withIndex("by_opportunity", (q) =>
          q.eq("opportunityId", opportunity._id),
        )
        .collect();
      for (const application of applications) {
        const student = await ctx.db.get(application.studentId);
        joined.push({ ...application, opportunity, student });
      }
    }
    return joined.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Apply to an open opportunity as the signed-in student. */
export const apply = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { opportunityId, note }) => {
    const userId = await requireUser(ctx);
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.STUDENT) {
      throw new Error("Only student accounts can apply");
    }

    const opportunity = await ctx.db.get(opportunityId);
    if (!opportunity || !opportunity.isOpen) {
      throw new Error("This opportunity is no longer open");
    }

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_student_opportunity", (q) =>
        q.eq("studentId", userId).eq("opportunityId", opportunityId),
      )
      .first();
    if (existing) throw new Error("You have already applied");

    const now = Date.now();
    await ctx.db.insert("applications", {
      opportunityId,
      studentId: userId,
      status: "applied",
      note: note?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Withdraw (delete) one of the student's own applications. */
export const withdraw = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const userId = await requireUser(ctx);
    const application = await ctx.db.get(applicationId);
    if (!application || application.studentId !== userId) {
      throw new Error("Application not found");
    }
    await ctx.db.delete(applicationId);
  },
});

/** Recruiter moves an application through the hiring pipeline. */
export const setStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: applicationStatusValidator,
  },
  handler: async (ctx, { applicationId, status }) => {
    const userId = await requireUser(ctx);
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found");
    const opportunity = await ctx.db.get(application.opportunityId);
    if (!opportunity || opportunity.createdBy !== userId) {
      throw new Error("This application belongs to another recruiter");
    }
    await ctx.db.patch(applicationId, { status, updatedAt: Date.now() });
  },
});
