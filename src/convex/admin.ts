import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { ROLES, roleValidator } from "./schema";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== ROLES.ADMIN) {
    throw new Error("Administrator access required");
  }
  return userId;
}

/** Platform-wide counts for the admin overview. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) return null;

    const allUsers = await ctx.db.query("users").collect();
    const opportunities = await ctx.db.query("opportunities").collect();
    const applications = await ctx.db.query("applications").collect();
    const comments = await ctx.db.query("comments").collect();

    const byStatus: Record<string, number> = {};
    for (const application of applications) {
      byStatus[application.status] = (byStatus[application.status] ?? 0) + 1;
    }

    return {
      students: allUsers.filter((u) => u.role === ROLES.STUDENT).length,
      recruiters: allUsers.filter((u) => u.role === ROLES.RECRUITER).length,
      admins: allUsers.filter((u) => u.role === ROLES.ADMIN).length,
      unassigned: allUsers.filter(
        (u) =>
          u.role !== ROLES.STUDENT &&
          u.role !== ROLES.RECRUITER &&
          u.role !== ROLES.ADMIN,
      ).length,
      opportunities: opportunities.length,
      openOpportunities: opportunities.filter((o) => o.isOpen).length,
      applications: applications.length,
      byStatus,
      comments: comments.length,
    };
  },
});

/** Every account on the platform, for the admin user table. */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) return [];

    const allUsers = await ctx.db.query("users").collect();
    const applications = await ctx.db.query("applications").collect();

    return allUsers
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role ?? ROLES.USER,
        createdAt: u._creationTime,
        applicationCount: applications.filter((a) => a.studentId === u._id)
          .length,
        isSelf: u._id === userId,
      }))
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

/** Change an account's role (student / recruiter / admin). */
export const setUserRole = mutation({
  args: { userId: v.id("users"), role: roleValidator },
  handler: async (ctx, { userId, role }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(userId, { role });
  },
});

/** Remove an account and everything it owns. Admins cannot remove themselves. */
export const removeUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const adminId = await requireAdmin(ctx);
    if (adminId === userId) throw new Error("You can't remove your own account");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const owned = await ctx.db
      .query("opportunities")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();
    for (const opportunity of owned) {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_opportunity", (q) =>
          q.eq("opportunityId", opportunity._id),
        )
        .collect();
      for (const app of apps) await ctx.db.delete(app._id);
      await ctx.db.delete(opportunity._id);
    }

    const theirApps = await ctx.db
      .query("applications")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .collect();
    for (const app of theirApps) await ctx.db.delete(app._id);

    const saves = await ctx.db
      .query("saved")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .collect();
    for (const save of saves) await ctx.db.delete(save._id);

    const ideas = await ctx.db
      .query("savedIdeas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const idea of ideas) await ctx.db.delete(idea._id);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (profile) await ctx.db.delete(profile._id);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    await ctx.db.delete(userId);
  },
});
