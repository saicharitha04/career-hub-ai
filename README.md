# HIKEHIVE — AI Powered Student Career Hub

HIKEHIVE is a student career platform: one feed for internships, hackathons,
placement drives, competitive exams, skill programs and workshops, with
application tracking for students and a posting workspace for recruiters.

**Version 1 scope** (what ships in this codebase):

- Opportunity feed — search, filter (category, mode), sort, save a shortlist
- Student flow — browse, save, apply, track applications through the pipeline
- Recruiter flow — publish opportunities, review applicants, update statuses
- Role selection (student / recruiter) with role-guarded routes

The AI modules (recommendations, resume matching, hackathon matchmaker, idea
generator, career assistant) are **not implemented yet** and are labeled
"In development" on the landing page. They are deliberately kept out of
version 1.

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript, Tailwind CSS v4, shadcn/ui,
  React Router v7, Framer Motion, Lucide icons
- **Backend & database:** Convex (reactive queries/mutations, schema-validated
  tables, TypeScript end to end)
- **Auth:** Convex Auth — email OTP + guest sign-in, roles stored per user

> Architecture note: the original project documentation specifies a Java
> Spring Boot backend with a Python AI service and PostgreSQL/MySQL. This
> environment (Freebuff) runs a managed Vite + Convex stack, so the backend is
> implemented with Convex instead of a JVM + relational database. The frontend
> is written strictly against an API layer (`src/convex/*`), so each file maps
> 1:1 onto a future Spring Boot REST controller:
>
> | Convex module             | Future Spring Boot equivalent |
> | ------------------------- | ----------------------------- |
> | `opportunities.ts`        | `OpportunityController`       |
> | `applications.ts`         | `ApplicationController`       |
> | `saves.ts`                | `SavedOpportunityController`  |
> | `roles.ts`                | `UserController`              |
> | `schema.ts`               | JPA entities                  |

## Project structure

```
src/
  components/        AppShell, Brand (logo), StatusBadge, ui/ (shadcn)
  convex/            Backend: schema.ts + opportunities/applications/saves/roles
  hooks/             use-auth
  lib/               opportunities.ts — shared labels, dates, helpers
  pages/
    Landing.tsx      Marketing site (hero, platform, roadmap, about)
    Auth.tsx         Sign in / register (email OTP, guest)
    RoleSelect.tsx   Choose student or recruiter workspace
    Dashboard.tsx    Role-aware redirect
    Feed.tsx         Opportunity feed — the main screen
    Applications.tsx Student application tracking
    Postings.tsx     Recruiter: create/manage opportunities
    Applicants.tsx   Recruiter: review applicants, update statuses
```

## Data model

- `users` — auth fields + `role` (`student` | `recruiter` | …)
- `opportunities` — title, organization, description, `category`
  (internship / hackathon / placement / exam / skill / workshop), skills[],
  eligibility, `mode` (remote / onsite / hybrid), location, deadline,
  compensation, applyUrl, isOpen, createdBy
- `applications` — opportunityId, studentId, `status` (applied → under_review →
  shortlisted → interview → selected / rejected), timestamps
- `saved` — studentId + opportunityId shortlist entries

Indexes: `opportunities.by_deadline / by_creator / by_category`,
`applications.by_student / by_opportunity / by_student_opportunity`,
`saved.by_student / by_student_opportunity`.

The feed is seeded with demo opportunities on first load
(`opportunities.ensureSeed`) so a fresh account lands on a browsable platform.

## Routes

| Route           | Access   | Screen                                    |
| --------------- | -------- | ----------------------------------------- |
| `/`             | public   | Landing page                              |
| `/auth`         | public   | Sign in / register (supports `?returnTo=`)|
| `/role`         | signed in| Choose student / recruiter workspace      |
| `/dashboard`    | signed in| Redirects to `/feed` or `/postings`       |
| `/feed`         | signed in| Opportunity feed (main screen)            |
| `/applications` | student  | Application tracking                      |
| `/postings`     | recruiter| Create & manage postings                  |
| `/applicants`   | recruiter| Review applicants, update statuses        |

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

## Design system — Minimalism

Near-monochrome palette with a faint cool ink tint, hairline borders, square
corners (`--radius: 0.125rem`), no shadows, tabular numerals, uppercase
letter-spaced labels, and generous white space. All tokens live in
`src/index.css` (oklch format) and flow through the shadcn/ui variables, so
the whole app themes from one place.

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
- Use toast (sonner) for confirmations and errors; use dialogs (with internal
  scroll) instead of new pages where reasonable.
- Keep designs responsive; avoid nested cards and shadows.
