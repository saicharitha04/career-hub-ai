import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
  STUDENT: "student",
  RECRUITER: "recruiter",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
  v.literal(ROLES.STUDENT),
  v.literal(ROLES.RECRUITER),
);
export type Role = Infer<typeof roleValidator>;

// Opportunity taxonomy — internships, hackathons, placement drives, exams,
// skill programs and workshops all live in one feed.
export const categoryValidator = v.union(
  v.literal("internship"),
  v.literal("hackathon"),
  v.literal("placement"),
  v.literal("exam"),
  v.literal("skill"),
  v.literal("workshop"),
);
export type OpportunityCategory = Infer<typeof categoryValidator>;

export const modeValidator = v.union(
  v.literal("remote"),
  v.literal("onsite"),
  v.literal("hybrid"),
);
export type OpportunityMode = Infer<typeof modeValidator>;

// Application lifecycle, from first submission to a final decision.
export const applicationStatusValidator = v.union(
  v.literal("applied"),
  v.literal("under_review"),
  v.literal("shortlisted"),
  v.literal("interview"),
  v.literal("selected"),
  v.literal("rejected"),
);
export type ApplicationStatus = Infer<typeof applicationStatusValidator>;

export const notificationKindValidator = v.union(
  v.literal("application"),
  v.literal("deadline"),
  v.literal("system"),
);
export type NotificationKind = Infer<typeof notificationKindValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // A single listing in the feed: internship, hackathon, placement drive,
    // competitive exam, skill program or workshop. Seeded entries have no
    // createdBy; recruiter-created entries point at their author.
    opportunities: defineTable({
      title: v.string(),
      organization: v.string(),
      description: v.string(),
      category: categoryValidator,
      skills: v.array(v.string()),
      // Domain tags (e.g. "ai", "web", "climate") power the hackathon
      // matchmaker and idea suggestions.
      tags: v.optional(v.array(v.string())),
      eligibility: v.string(),
      mode: modeValidator,
      location: v.optional(v.string()),
      deadline: v.number(), // ms timestamp — the application deadline
      compensation: v.optional(v.string()),
      applyUrl: v.optional(v.string()),
      isOpen: v.boolean(),
      createdBy: v.optional(v.id("users")),
      createdAt: v.number(),
    })
      .index("by_deadline", ["deadline"])
      .index("by_creator", ["createdBy"])
      .index("by_category", ["category"]),

    // A student's application to one opportunity. Status is owned by the
    // recruiter who posted the opportunity; interviewTime is set when the
    // recruiter schedules the interview.
    applications: defineTable({
      opportunityId: v.id("opportunities"),
      studentId: v.id("users"),
      status: applicationStatusValidator,
      interviewTime: v.optional(v.number()),
      note: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_student", ["studentId"])
      .index("by_opportunity", ["opportunityId"])
      .index("by_student_opportunity", ["studentId", "opportunityId"]),

    // Saved (bookmarked) opportunities.
    saved: defineTable({
      opportunityId: v.id("opportunities"),
      studentId: v.id("users"),
      createdAt: v.number(),
    })
      .index("by_student", ["studentId"])
      .index("by_student_opportunity", ["studentId", "opportunityId"]),

    // The signed-in user's career profile: what the match tools score
    // against, plus the uploaded resume.
    profiles: defineTable({
      userId: v.id("users"),
      headline: v.optional(v.string()),
      phone: v.optional(v.string()),
      education: v.optional(v.string()),
      graduationYear: v.optional(v.string()),
      skills: v.array(v.string()),
      interests: v.array(v.string()),
      goals: v.optional(v.string()),
      resumeName: v.optional(v.string()),
      resumeSize: v.optional(v.number()),
      resumeStorageId: v.optional(v.id("_storage")),
      updatedAt: v.number(),
    }).index("by_user", ["userId"]),

    // Event notifications: application updates, new applications, announcements.
    notifications: defineTable({
      userId: v.id("users"),
      kind: notificationKindValidator,
      title: v.string(),
      body: v.string(),
      link: v.optional(v.string()),
      read: v.boolean(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Open questions on a listing — the team's Q&A thread.
    comments: defineTable({
      opportunityId: v.id("opportunities"),
      userId: v.id("users"),
      body: v.string(),
      createdAt: v.number(),
    }).index("by_opportunity", ["opportunityId"]),

    // Ideas the user saved from the Idea Generator.
    savedIdeas: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.string(),
      problem: v.string(),
      domain: v.string(),
      difficulty: v.string(),
      technologies: v.array(v.string()),
      features: v.array(v.string()),
      approach: v.string(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
