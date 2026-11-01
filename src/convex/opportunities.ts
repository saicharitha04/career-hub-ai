import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  MutationCtx,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { categoryValidator, modeValidator, ROLES } from "./schema";

const DAY = 24 * 60 * 60 * 1000;

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  return userId;
}

async function requireManager(ctx: QueryCtx | MutationCtx) {
  const userId = await requireUser(ctx);
  const user = await ctx.db.get(userId);
  if (user?.role !== ROLES.RECRUITER && user?.role !== ROLES.ADMIN) {
    throw new Error("Only recruiter or admin accounts can manage opportunities");
  }
  return { userId, isAdmin: user?.role === ROLES.ADMIN };
}

/** Every opportunity in the feed, nearest deadline first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const opportunities = await ctx.db.query("opportunities").collect();
    return opportunities.sort((a, b) => a.deadline - b.deadline);
  },
});

/** One opportunity for its detail page. Optional so a malformed URL 404s
 *  gracefully instead of failing argument validation. */
export const get = query({
  args: { opportunityId: v.optional(v.id("opportunities")) },
  handler: async (ctx, { opportunityId }) => {
    if (opportunityId === undefined) return null;
    return await ctx.db.get(opportunityId);
  },
});

/** Opportunities authored by the signed-in recruiter. */
export const listByCreator = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.RECRUITER) return [];
    return await ctx.db
      .query("opportunities")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    organization: v.string(),
    description: v.string(),
    category: categoryValidator,
    skills: v.array(v.string()),
    tags: v.optional(v.array(v.string())),
    eligibility: v.string(),
    mode: modeValidator,
    location: v.optional(v.string()),
    deadline: v.number(),
    compensation: v.optional(v.string()),
    applyUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireManager(ctx);

    const title = args.title.trim();
    const organization = args.organization.trim();
    const description = args.description.trim();
    const eligibility = args.eligibility.trim();
    const skills = args.skills.map((s) => s.trim()).filter(Boolean);
    const tags = args.tags?.map((s) => s.trim().toLowerCase()).filter(Boolean);
    const location = args.location?.trim();

    if (!title || !organization || !description || !eligibility) {
      throw new Error("Title, organization, description and eligibility are required");
    }
    if (!Number.isFinite(args.deadline) || args.deadline <= Date.now()) {
      throw new Error("The application deadline must be in the future");
    }

    await ctx.db.insert("opportunities", {
      title,
      organization,
      description,
      category: args.category,
      skills,
      tags: tags && tags.length > 0 ? tags : undefined,
      eligibility,
      mode: args.mode,
      location: location ? location : undefined,
      deadline: args.deadline,
      compensation: args.compensation?.trim() || undefined,
      applyUrl: args.applyUrl?.trim() || undefined,
      isOpen: true,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

/** Close or reopen an opportunity — its poster or an admin. */
export const setOpen = mutation({
  args: { opportunityId: v.id("opportunities"), isOpen: v.boolean() },
  handler: async (ctx, { opportunityId, isOpen }) => {
    const { userId, isAdmin } = await requireManager(ctx);
    const opportunity = await ctx.db.get(opportunityId);
    if (!opportunity || (opportunity.createdBy !== userId && !isAdmin)) {
      throw new Error("Opportunity not found");
    }
    await ctx.db.patch(opportunityId, { isOpen });
  },
});

/** Delete an opportunity and its applications — its poster or an admin. */
export const remove = mutation({
  args: { opportunityId: v.id("opportunities") },
  handler: async (ctx, { opportunityId }) => {
    const { userId, isAdmin } = await requireManager(ctx);
    const opportunity = await ctx.db.get(opportunityId);
    if (!opportunity || (opportunity.createdBy !== userId && !isAdmin)) {
      throw new Error("Opportunity not found");
    }
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_opportunity", (q) => q.eq("opportunityId", opportunityId))
      .collect();
    for (const application of applications) {
      await ctx.db.delete(application._id);
    }
    await ctx.db.delete(opportunityId);
  },
});

/**
 * Seed demo opportunities the first time the feed is opened, so the platform
 * is browsable before recruiters post. Only ever runs against an empty table.
 */
export const ensureSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("opportunities").first();
    if (existing !== null) return;

    const now = Date.now();
    const seeds = [
      {
        title: "Software Engineering Intern",
        organization: "Stripe",
        description:
          "Join a payments infrastructure team for a 12-week summer internship. You will ship production code on services that move money for millions of businesses, with a dedicated mentor and a scope of your own from week one.",
        category: "internship" as const,
        skills: ["Java", "Data Structures", "APIs", "SQL"],
        tags: ["backend", "systems", "web"],
        eligibility: "Pre-final or final year students, any engineering branch",
        mode: "hybrid" as const,
        location: "Bengaluru",
        compensation: "₹80,000 / month",
        applyUrl: "https://stripe.com/jobs",
      },
      {
        title: "Frontend Engineering Intern",
        organization: "Figma",
        description:
          "Work alongside product engineers on the Figma design editor. You will own a feature end to end — from prototype to release — and pair with designers on interaction details.",
        category: "internship" as const,
        skills: ["TypeScript", "React", "CSS", "Accessibility"],
        tags: ["web", "design"],
        eligibility: "Students graduating in 2027 or later",
        mode: "remote" as const,
        compensation: "₹60,000 / month",
        applyUrl: "https://figma.com/careers",
      },
      {
        title: "HackMIT 2026",
        organization: "MIT",
        description:
          "A 36-hour in-person hackathon with tracks in climate, health, education and open innovation. Workshops, mentorship from industry engineers and a demo day in front of a live jury.",
        category: "hackathon" as const,
        skills: ["Any stack", "Prototyping", "Pitching"],
        tags: ["ai", "climate", "health", "education"],
        eligibility: "Enrolled university students, all levels",
        mode: "onsite" as const,
        location: "Cambridge, MA",
        compensation: "Prizes up to $15,000",
        applyUrl: "https://hackmit.org",
      },
      {
        title: "Smart India Hackathon — Internal Round",
        organization: "Ministry of Education, Govt. of India",
        description:
          "The internal selection round for SIH. Teams of six solve problem statements from real industry partners; selected teams advance to the grand finale.",
        category: "hackathon" as const,
        skills: ["Problem Solving", "Teamwork", "Any stack"],
        tags: ["open", "ai", "web"],
        eligibility: "Teams of 6 students with one faculty mentor",
        mode: "onsite" as const,
        location: "Campus edition",
        applyUrl: "https://sih.gov.in",
      },
      {
        title: "Campus Placement Drive — Analyst",
        organization: "Deloitte",
        description:
          "On-campus hiring drive for analyst roles across risk, finance and technology consulting. The process includes an aptitude round, a case interview and a technical discussion.",
        category: "placement" as const,
        skills: ["Aptitude", "Communication", "Excel"],
        tags: ["finance", "consulting"],
        eligibility: "Final year students, CGPA 7.0 and above",
        mode: "onsite" as const,
        location: "Hyderabad",
        compensation: "₹9.5 LPA",
      },
      {
        title: "UPSC Civil Services Preliminary Examination",
        organization: "Union Public Service Commission",
        description:
          "The national-level competitive examination for entry into the civil services. Two objective papers on the same day, qualifying in nature for the mains examination.",
        category: "exam" as const,
        skills: ["General Studies", "CSAT", "Current Affairs"],
        tags: ["civil-services"],
        eligibility: "Graduates aged 21–32 (relaxation as per category rules)",
        mode: "onsite" as const,
        location: "Exam centres nationwide",
      },
      {
        title: "Google Cloud Certified — Associate Cloud Engineer",
        organization: "Google Cloud",
        description:
          "A self-paced skill program covering core Google Cloud services, deployment and monitoring. Includes lab credits and a practice assessment before the certification exam.",
        category: "skill" as const,
        skills: ["Cloud", "Linux", "Networking"],
        tags: ["cloud", "devops"],
        eligibility: "Open to all students",
        mode: "remote" as const,
        compensation: "50% exam discount for students",
        applyUrl: "https://cloud.google.com/learn/certification",
      },
      {
        title: "Full-Stack Bootcamp Workshop",
        organization: "JetBrains Academy",
        description:
          "A two-day hands-on workshop on building and deploying full-stack applications, with code review sessions from working engineers and a certificate of completion.",
        category: "workshop" as const,
        skills: ["JavaScript", "Git", "Databases"],
        tags: ["web", "tools"],
        eligibility: "Open to all students, limited to 60 seats",
        mode: "hybrid" as const,
        location: "Pune",
      },
      {
        title: "Data Science Research Internship",
        organization: "CureFit",
        description:
          "A research-oriented internship building recommendation and forecasting models for consumer health products. Publishable work with a strong publication track record on the team.",
        category: "internship" as const,
        skills: ["Python", "Pandas", "Machine Learning", "Statistics"],
        tags: ["ai", "data", "health"],
        eligibility: "Final year students or recent graduates",
        mode: "hybrid" as const,
        location: "Bengaluru",
        compensation: "₹50,000 / month",
      },
      {
        title: "TCS National Qualifier Test",
        organization: "Tata Consultancy Services",
        description:
          "The national hiring test for graduate engineer trainees. Online aptitude, programming and communication assessments followed by interviews for shortlisted candidates.",
        category: "exam" as const,
        skills: ["Aptitude", "Programming", "Communication"],
        tags: ["general"],
        eligibility: "Pre-final and final year engineering students",
        mode: "remote" as const,
        compensation: "₹3.6–6.8 LPA",
      },
    ];

    for (const seed of seeds) {
      await ctx.db.insert("opportunities", {
        ...seed,
        deadline: now + (7 + Math.floor(Math.random() * 60)) * DAY,
        isOpen: true,
        createdAt: now,
      });
    }
  },
});
