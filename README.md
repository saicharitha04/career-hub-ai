# HIKEHIVE — AI Powered Student Career Hub

HIKEHIVE is a student career platform: one feed for internships, hackathons,
placement drives, competitive exams, skill programs and workshops — with
application tracking, a recruiter workspace, an admin area and clearly-labelled
match tools. Dark-mode first, built for speed.

## What ships in this codebase

**Students**
- Opportunity feed — search, filter (category, skill, mode), sort, saved shortlist
- Full detail page per listing with a Q&A comment thread
- One-click apply, application tracking through the pipeline
- Interview slots scheduled by recruiters, shown on the tracker
- Notification bell — application updates and event notifications
- Profile + resume upload (PDF/DOCX to Convex storage)
- Dashboard home — counts, skill-ranked recommendations, deadlines, notifications
- AI tool screens: Skill Match, Hackathon Matchmaker, Idea Generator

**Recruiters**
- Publish/close/delete internships, hackathons, drives, exams and workshops
- Applicant review queue, pipeline status control, interview scheduling

**Administrators**
- Platform stats, application-pipeline breakdown, account and role management,
  opportunity management

**Roles** — student, recruiter and admin, chosen at `/role` right after sign-in
and switchable from the account menu.

## Honest scope notes

The three "AI tool" screens use **deterministic local scoring and a curated
idea library** — real, working logic, but not a trained model. Every screen
says so in place. The generative/NLP layer (Python FastAPI service: resume
parsing, recommendations, idea generation, career assistant) is the planned
next module and is not yet connected. Payments and DMs are out of scope.

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript, Tailwind CSS v4, shadcn/ui,
  React Router v7, next-themes (dark default + toggle), Framer Motion, Lucide
- **Backend & database:** Convex — reactive queries/mutations, schema-validated
  tables, file storage for resumes, TypeScript end to end
- **Auth:** Convex Auth — email OTP + guest sign-in; roles stored per user

> Architecture note: the project documentation specifies a Java Spring Boot
> backend with Python AI services on MySQL. This environment (Freebuff) runs a
> managed Vite + Convex stack, so the backend is implemented with Convex. The
> frontend talks only to `src/convex/*`, which maps 1:1 onto a future Spring
> Boot REST layer:
>
> | Convex module            | Future Spring Boot equivalent |
> | ------------------------ | ----------------------------- |
> | `opportunities.ts`       | `OpportunityController`       |
> | `applications.ts`        | `ApplicationController`       |
> | `saves.ts`               | `SavedOpportunityController`  |
> | `profiles.ts`            | `ProfileController`           |
> | `notifications.ts`       | `NotificationController`      |
> | `comments.ts`            | `CommentController`           |
> | `ideas.ts`               | `IdeaController`              |
> | `admin.ts`               | `AdminController`             |
> | `roles.ts`               | `UserController`              |
> | `schema.ts`              | JPA entities                  |

## Project structure

```
src/
  components/     AppShell (header/nav), Brand, ThemeToggle, NotificationsBell, StatusBadge, ui/
  convex/         Backend: schema + opportunities/applications/saves/profiles/
                  notifications/comments/ideas/admin/roles/files
  hooks/          use-auth
  lib/            opportunities.ts (labels, scoring helpers), resume.ts (upload), utils.ts
  pages/
    Landing.tsx            Marketing site (hero, stats, features, AI tools, testimonials, contact)
    Auth.tsx               Passwordless sign in / register (email OTP, guest)
    RoleSelect.tsx         Choose student / recruiter / admin + display name
    Dashboard.tsx          Student dashboard home
    Feed.tsx               Opportunity feed — the main screen
    OpportunityDetail.tsx  One listing: details, actions, comment thread
    Applications.tsx       Student application tracking (+ interview slots)
    Postings.tsx           Recruiter: create/manage postings (+ domain tags)
    Applicants.tsx         Recruiter: review applicants, statuses, scheduling
    Profile.tsx            Profile form + resume upload
    ToolsMatch.tsx         Skill Match (resume-to-internship)
    ToolsHackathons.tsx    Hackathon Matchmaker
    ToolsIdeas.tsx         Idea Generator (+ saved ideas)
    Admin.tsx              Admin workspace
```

## Data model

- `users` — auth fields + `role` (student / recruiter / admin)
- `opportunities` — title, organization, description, category
  (internship / hackathon / placement / exam / skill / workshop), skills[],
  tags[] (domains), eligibility, mode, location, deadline, compensation,
  applyUrl, isOpen, createdBy
- `applications` — opportunityId, studentId, status (applied → under_review →
  shortlisted → interview → selected / rejected), optional interviewTime
- `saved` — student shortlist entries
- `profiles` — headline, phone, education, graduation year, skills[], interests[],
  goals, resume metadata (file lives in Convex storage)
- `notifications` — per-user events (application updates, announcements)
- `comments` — per-opportunity Q&A thread
- `savedIdeas` — ideas kept from the Idea Generator

The feed seeds itself with realistic demo listings on first load
(`opportunities.ensureSeed`) so a fresh account lands on a browsable platform.

## Routes

| Route               | Access   | Screen                                    |
| ------------------- | -------- | ----------------------------------------- |
| `/`                 | public   | Landing page                              |
| `/auth`             | public   | Sign in / register (`?returnTo=` support) |
| `/role`             | signed in| Pick workspace + display name             |
| `/dashboard`        | role-routed | Student home / recruiter / admin redirect |
| `/feed`             | signed in| Opportunity feed (`?category=` filters)   |
| `/opportunities/:id`| signed in| Listing detail + comments                 |
| `/applications`     | student  | Application tracking                      |
| `/postings`         | recruiter| Create & manage postings                  |
| `/applicants`       | recruiter| Review applicants, schedule interviews    |
| `/profile`          | signed in| Profile + resume upload                   |
| `/tools/match`      | signed in| Skill Match                               |
| `/tools/hackathons` | signed in| Hackathon Matchmaker                      |
| `/tools/ideas`      | signed in| Idea Generator + saved ideas              |
| `/admin`            | admin    | Platform control                          |

## Running the project

The project runs on Freebuff: the Vite dev server and the Convex backend are
managed by the platform. Locally, with a Convex deployment configured:

```bash
bun install
bun convex dev          # syncs backend + regenerates src/convex/_generated
bun run dev             # vite dev server
```

Type checking:

```bash
bun convex dev --once   # regenerate Convex types
bun tsc -b --noEmit
```

Environment variables are managed by the platform (see the Keys tab); `.env`
files are not edited by hand. Email sign-in requires the deployment's
`VLY_INTEGRATION_KEY`; guest sign-in works without any configuration.

## Design system — "Hive dark"

Deep navy/charcoal backgrounds (dark is the default, with a working light
mode), royal blue primary and teal/cyan accents, blue→teal gradient CTAs,
rounded cards, soft indigo glow behind heroes, mono type for technical labels.
All tokens live in `src/index.css` (oklch) and flow through the shadcn/ui
variables, plus three utilities: `.text-gradient`, `.cta-gradient`,
`.app-glow`.

---

# Template conventions (still in force)

- Backend functions live in `src/convex/*`; never hand-edit
  `src/convex/_generated/*` — run `bun convex dev --once` instead.
- Auth files (`src/convex/auth.ts`, `src/convex/auth.config.ts`,
  `src/convex/auth/emailOtp.ts`, `src/convex/users.ts`) are read-only.
- Use the `useAuth` hook (`src/hooks/use-auth`) for auth state; wrap protected
  routes in `RequireAuth`.
- Pages go in `src/pages`, components in `src/components`, shadcn primitives
  in `src/components/ui`.
- Use toast (sonner) for confirmations and errors; dialogs should scroll
  internally so content never clips.
- Keep designs responsive; avoid nested cards and shadows.
