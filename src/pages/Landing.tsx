import { HiveMark, Wordmark } from "@/components/Brand";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  Filter,
  LayoutList,
  Search,
  Users,
} from "lucide-react";
import { Link } from "react-router";

/** Subtle scroll reveal — restrained motion, in keeping with the theme. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
      <span className="font-mono tabular-nums">{index}</span>
      <span className="h-px w-8 bg-border" />
      {children}
    </p>
  );
}

const CATEGORIES = [
  "Internships",
  "Hackathons",
  "Placement drives",
  "Competitive exams",
  "Skill programs",
  "Workshops",
];

const FEATURES = [
  {
    icon: LayoutList,
    title: "One feed, every opportunity",
    body: "Internships, hackathons, placement drives, exams, skill programs and workshops from every organization, in a single browsable feed.",
  },
  {
    icon: Filter,
    title: "Filters that matter",
    body: "Narrow by category and mode, search across titles, organizations and skills, and sort by the deadline that's closing soonest.",
  },
  {
    icon: Bookmark,
    title: "Build a shortlist",
    body: "Save the listings worth a second look. Your shortlist stays one click away, ready when you are.",
  },
  {
    icon: ArrowRight,
    title: "Apply and track",
    body: "Apply in one click and follow every application through the pipeline — applied, under review, shortlisted, interview, selected.",
  },
  {
    icon: Users,
    title: "Recruiter workspace",
    body: "Recruiters publish opportunities, review applicants and move candidates through their pipeline without leaving the platform.",
  },
  {
    icon: Search,
    title: "Deadline clarity",
    body: "Every listing states its deadline in plain language — closing in five days, closing tomorrow — so nothing slips past you.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your account",
    body: "Sign in with your email in seconds and choose your side — student or recruiter.",
  },
  {
    number: "02",
    title: "Find your opportunities",
    body: "Students browse, filter and save. Recruiters publish internships, hackathons and drives to the same feed.",
  },
  {
    number: "03",
    title: "Apply and follow through",
    body: "Submit applications and watch each one move through the pipeline until a decision lands.",
  },
];

const ROADMAP = [
  {
    title: "AI opportunity recommendations",
    body: "Suggestions ranked against your skills, interests and career goals.",
  },
  {
    title: "Resume-to-internship matching",
    body: "Upload a resume and see a match score, missing skills and how to close the gap.",
  },
  {
    title: "AI hackathon matchmaker",
    body: "Hackathons matched to your domain preferences, experience level and team setup.",
  },
  {
    title: "AI idea generator",
    body: "Pick a domain and difficulty, get project ideas with suggested tech and features.",
  },
  {
    title: "AI career assistant",
    body: "An always-on assistant for interview prep, skill planning and career guidance.",
  },
];

const FOOTER_LINKS: { label: string; to?: string; href?: string }[] = [
  { label: "Platform", href: "#platform" },
  { label: "AI modules", href: "#roadmap" },
  { label: "About", href: "#about" },
  { label: "Sign in", to: "/auth" },
  { label: "Explore", to: "/auth?returnTo=%2Ffeed" },
];

const FOOTER_LINK_CLASS =
  "text-[11px] tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-5 sm:px-6">
          <Link to="/" className="transition-opacity hover:opacity-70">
            <Wordmark />
          </Link>

          <nav className="ml-auto hidden items-center gap-6 md:flex">
            {[
              { href: "#about", label: "About Us" },
              { href: "#platform", label: "Platform" },
              { href: "#roadmap", label: "AI Career Assistant" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <Link
              to="/auth"
              className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="border border-foreground bg-foreground px-3 py-1.5 text-[11px] tracking-[0.16em] text-background uppercase transition-opacity hover:opacity-85"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="flex items-center gap-3 text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
            <HiveMark className="size-3" />
            AI Powered Student Career Hub
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-medium tracking-tight sm:text-6xl">
            Your Career Journey
            <br className="hidden sm:block" /> Starts Here.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
            Discover opportunities, improve your skills, build your future, and
            achieve your career goals with AI-powered guidance.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-85"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/auth?returnTo=%2Ffeed"
              className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm transition-colors hover:border-foreground"
            >
              Explore Opportunities
            </Link>
          </div>

          {/* Category rail */}
          <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-4">
            {CATEGORIES.map((category, i) => (
              <span key={category} className="flex items-center gap-6">
                <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  {category}
                </span>
                {i < CATEGORIES.length - 1 && (
                  <span className="hidden h-3 w-px bg-border sm:block" />
                )}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Feed preview */}
        <Reveal delay={0.1} className="mt-12">
          <div className="border border-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Opportunity feed
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                preview
              </span>
            </div>
            {[
              {
                n: "01",
                type: "Internship",
                title: "Software Engineering Intern",
                org: "Stripe",
                meta: "Hybrid · Bengaluru",
                due: "Closes in 12 days",
              },
              {
                n: "02",
                type: "Hackathon",
                title: "Smart India Hackathon — Internal Round",
                org: "Ministry of Education",
                meta: "On-site · Campus edition",
                due: "Closes in 5 days",
              },
              {
                n: "03",
                type: "Placement Drive",
                title: "Campus Placement Drive — Analyst",
                org: "Deloitte",
                meta: "On-site · Hyderabad",
                due: "Closes tomorrow",
              },
            ].map((row) => (
              <div
                key={row.n}
                className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[2.5rem_7rem_1fr_auto]"
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {row.n}
                </span>
                <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {row.type}
                </span>
                <span className="col-start-2 mt-1 min-w-0 sm:col-start-auto sm:mt-0">
                  <span className="block truncate text-sm font-medium">
                    {row.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {row.org} · {row.meta}
                  </span>
                </span>
                <span className="col-start-2 mt-2 text-xs text-muted-foreground sm:col-start-auto sm:mt-0 sm:text-right">
                  {row.due}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Platform */}
      <section id="platform" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="01">The platform</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
              Everything a student needs, in one quiet, focused place.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.04}>
                <div className="h-full bg-background p-7">
                  <feature.icon className="size-5 text-foreground" strokeWidth={1.5} />
                  <h3 className="mt-5 text-base font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="02">How it works</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
              From sign-up to decision in three steps.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-12">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 0.06}>
                <div className="border-t border-foreground pt-5">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {step.number}
                  </span>
                  <h3 className="mt-3 text-lg font-medium tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="03">Two sides, one platform</SectionLabel>
          </Reveal>
          <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
            <Reveal>
              <div className="h-full bg-background p-8 sm:p-10">
                <h3 className="text-xl font-medium tracking-tight">
                  For students
                </h3>
                <ul className="mt-6 flex flex-col gap-4 text-sm leading-6 text-muted-foreground">
                  {[
                    "One feed for internships, hackathons, placements, exams and skill programs",
                    "Search, filter and sort until the right opportunity surfaces",
                    "Save a shortlist and apply in a single click",
                    "Track every application from applied to selected",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2.5 size-1 shrink-0 bg-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className="mt-8 inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-85"
                >
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="h-full bg-background p-8 sm:p-10">
                <h3 className="text-xl font-medium tracking-tight">
                  For recruiters
                </h3>
                <ul className="mt-6 flex flex-col gap-4 text-sm leading-6 text-muted-foreground">
                  {[
                    "Publish internships, drives and hackathons straight to students",
                    "Structured applications with skills, eligibility and deadlines",
                    "Review applicants and move them through your pipeline",
                    "Close or reopen a posting whenever the roles fill",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2.5 size-1 shrink-0 bg-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className="mt-8 inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm transition-colors hover:border-foreground"
                >
                  Post an opportunity
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="04">On the roadmap</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
              The AI layer, built next.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Version 1 ships the opportunity feed, applications and the
              recruiter workspace. These AI modules are in active development
              and are not yet connected — we list them here so you know exactly
              what is shipping next.
            </p>
          </Reveal>

          <div className="mt-12 border-t border-border">
            {ROADMAP.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div className="flex flex-col gap-2 border-b border-border py-6 sm:flex-row sm:items-baseline sm:gap-10">
                  <span className="w-40 shrink-0 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                    In development
                  </span>
                  <div>
                    <h3 className="text-base font-medium">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="05">About us</SectionLabel>
            <div className="mt-8 grid gap-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
              <h2 className="text-3xl leading-tight font-medium tracking-tight">
                Built for the way students actually search.
              </h2>
              <div className="flex flex-col gap-5 text-sm leading-7 text-muted-foreground">
                <p>
                  HIKEHIVE — AI Powered Student Career Hub — exists because a
                  student&apos;s opportunities live in a hundred places at once:
                  department notice boards, WhatsApp groups, corporate career
                  pages and hackathon aggregators. The best ones are usually the
                  ones you hear about last.
                </p>
                <p>
                  We bring internships, hackathons, placement drives,
                  competitive exams, skill programs and workshops into a single
                  feed with honest deadlines, real eligibility rules and an
                  application tracker that tells you where you stand — and
                  recruiters a workspace to reach students without
                  intermediaries.
                </p>
                <p className="text-foreground">
                  Your Career Journey Starts Here.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Wordmark />
              <p className="mt-3 max-w-xs text-xs leading-5 text-muted-foreground">
                AI Powered Student Career Hub. One feed for internships,
                hackathons, placements, exams and skill programs.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {FOOTER_LINKS.map((link) =>
                link.to ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={FOOTER_LINK_CLASS}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className={FOOTER_LINK_CLASS}
                  >
                    {link.label}
                  </a>
                ),
              )}
            </nav>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} HIKEHIVE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
