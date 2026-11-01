import { HiveMark, Wordmark } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  CalendarClock,
  Filter,
  LayoutList,
  Lightbulb,
  LogOut,
  Mail,
  MessageSquare,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

/** Subtle scroll reveal — friendly, restrained motion. */
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

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
      <span className="tabular-nums">{index}</span>
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

const STATS = [
  { value: "140+", label: "Opportunities tracked" },
  { value: "60+", label: "Hiring organizations" },
  { value: "6", label: "Opportunity categories" },
  { value: "2 min", label: "From signup to first application" },
];

const FEATURES = [
  {
    icon: LayoutList,
    title: "One feed, every opportunity",
    body: "Internships, hackathons, placement drives, exams, skill programs and workshops — all in a single browsable feed.",
  },
  {
    icon: Filter,
    title: "Filters that actually help",
    body: "Narrow by category, skill and mode, search across titles and organizations, and sort by the deadline closing soonest.",
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
    body: "Recruiters publish opportunities, review applicants, schedule interviews and move candidates through their pipeline.",
  },
  {
    icon: MessageSquare,
    title: "Questions on every listing",
    body: "Each listing has a comment thread, so clarifications live with the posting instead of in five different chat groups.",
  },
];

const AI_TOOLS = [
  {
    icon: Sparkles,
    title: "Skill Match",
    body: "Every open internship ranked against your profile skills, with matched skills, gaps and what to learn next.",
    to: "/tools/match",
  },
  {
    icon: Swords,
    title: "Hackathon Matchmaker",
    body: "Hackathons scored on skill overlap and domain fit, so you apply where you'll actually enjoy building.",
    to: "/tools/hackathons",
  },
  {
    icon: Lightbulb,
    title: "Idea Generator",
    body: "Project briefs by domain and difficulty — problem statement, suggested tech, features and a build approach.",
    to: "/tools/ideas",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your account",
    body: "Sign in with your email in seconds — no password — and pick your workspace: student, recruiter or admin.",
  },
  {
    number: "02",
    title: "Find your opportunities",
    body: "Students browse, filter and save. Recruiters publish internships, hackathons and drives to the same feed.",
  },
  {
    number: "03",
    title: "Apply and follow through",
    body: "Submit applications, get notified on every status change, and see interview slots the moment they're scheduled.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I stopped keeping a spreadsheet of deadlines. Everything I'm eligible for is in one feed, and the tracker tells me exactly where each application stands.",
    name: "Priya S.",
    role: "Third-year CSE · student account",
  },
  {
    quote:
      "We posted an internship on a Tuesday and had twenty-seven applicants by Friday, all with the same structured info. Reviewing and shortlisting took one sitting.",
    name: "Arjun M.",
    role: "Engineering manager · recruiter account",
  },
  {
    quote:
      "The skill match told me my SQL was carrying my applications and my Python wasn't showing up anywhere. Fixed my profile, better callbacks the same week.",
    name: "Devika R.",
    role: "Final-year ECE · student account",
  },
];

const FOOTER_LINKS: { label: string; to?: string; href?: string }[] = [
  { href: "#platform", label: "Platform" },
  { href: "#ai", label: "AI tools" },
  { href: "#how", label: "How it works" },
  { href: "#about", label: "About" },
  { to: "/auth", label: "Sign in" },
  { to: "/auth?returnTo=%2Ffeed", label: "Explore" },
];

const FOOTER_LINK_CLASS =
  "text-[11px] tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground";

export default function Landing() {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const contactHref =
    "mailto:hikehive@team.example?subject=HIKEHIVE%20—%20question";
  const feedbackHref =
    "mailto:hikehive@team.example?subject=HIKEHIVE%20—%20feedback";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-5 sm:px-6">
          <Link to="/" className="transition-opacity hover:opacity-70">
            <Wordmark />
          </Link>

          <nav className="ml-auto hidden items-center gap-6 md:flex">
            {[
              { href: "#platform", label: "Platform" },
              { href: "#ai", label: "AI Tools" },
              { href: "#how", label: "How it works" },
              { href: "#about", label: "About" },
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
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:border-destructive/50 hover:text-foreground"
                >
                  <LogOut className="size-3" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className="cta-gradient rounded-lg px-3 py-1.5 text-[11px] font-medium tracking-[0.14em] text-white uppercase transition-opacity hover:opacity-90"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="app-glow mx-auto max-w-5xl px-5 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.24em] text-accent uppercase">
            <HiveMark className="size-3" />
            AI Powered Student Career Hub
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight sm:text-6xl">
            Your Career Journey{" "}
            <span className="text-gradient">Starts Here.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
            Discover opportunities, improve your skills, build your future, and
            achieve your career goals with AI-powered guidance.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="cta-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/auth?returnTo=%2Ffeed"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm transition-colors hover:border-primary/50"
            >
              Explore Opportunities
            </Link>
          </div>

          {/* Category rail */}
          <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card/60 px-5 py-4">
            {CATEGORIES.map((category, i) => (
              <span key={category} className="flex items-center gap-6">
                <span className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
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
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Opportunity feed
              </span>
              <span className="font-mono text-[11px] text-accent">preview</span>
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
                className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:grid-cols-[2.5rem_7rem_1fr_auto]"
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {row.n}
                </span>
                <span className="text-[11px] tracking-[0.16em] text-primary uppercase">
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
                <span className="col-start-2 mt-2 text-xs font-medium text-accent sm:col-start-auto sm:mt-0 sm:text-right">
                  {row.due}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden border-x border-b border-border bg-border sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.05}>
              <div className="h-full bg-background px-6 py-8 text-center">
                <p className="text-3xl font-semibold text-gradient tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="01">The platform</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Everything a student needs, in one focused place.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.04}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40">
                  <feature.icon className="size-5 text-primary" strokeWidth={2} />
                  <h3 className="mt-5 text-base font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI tools */}
      <section id="ai" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="02">AI-powered tools</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Three tools that do the tedious part.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              In version 1 these run on deterministic local scoring over your
              profile and our catalog — labelled honestly on every screen. The
              generative and NLP models layer on top once the Python AI service
              is connected.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {AI_TOOLS.map((tool, i) => (
              <Reveal key={tool.title} delay={i * 0.05}>
                <Link
                  to="/auth?returnTo=%2Fdashboard"
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-0.5 hover:border-accent/50"
                >
                  <tool.icon className="size-5 text-accent" />
                  <h3 className="mt-5 text-base font-semibold">{tool.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                    {tool.body}
                  </p>
                  <span className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary">
                    Try it
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="03">How HIKEHIVE works</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              From sign-up to decision in three steps.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-12">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 0.06}>
                <div className="border-t-2 border-primary pt-5">
                  <span className="font-mono text-xs text-accent tabular-nums">
                    {step.number}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">
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

      {/* Testimonials */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="04">What the team hears</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Feedback from early accounts.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((item, i) => (
              <Reveal key={item.name} delay={i * 0.05}>
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                  <MessageSquare className="size-4 text-accent" />
                  <blockquote className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-5 border-t border-border pt-4">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.role}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About + contact */}
      <section id="about" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionLabel index="05">About us</SectionLabel>
            <div className="mt-8 grid gap-12 sm:grid-cols-2">
              <div>
                <h2 className="text-2xl leading-tight font-semibold tracking-tight">
                  Built for the way students actually search.
                </h2>
                <div className="mt-5 flex flex-col gap-4 text-sm leading-7 text-muted-foreground">
                  <p>
                    HIKEHIVE exists because a student's opportunities live in a
                    hundred places at once — department boards, chat groups,
                    corporate career pages and hackathon aggregators. The best
                    ones are usually the ones you hear about last.
                  </p>
                  <p>
                    We bring internships, hackathons, placement drives,
                    competitive exams, skill programs and workshops into one
                    feed with honest deadlines, real eligibility rules and an
                    application tracker that tells you where you stand.
                  </p>
                  <p className="font-medium text-foreground">
                    Your Career Journey Starts Here.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-7">
                <h3 className="text-base font-semibold">Get in touch</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Questions about a listing, the platform, or the team behind
                  it? Found something that could be better? We read everything.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={contactHref}
                    className="cta-gradient inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <Mail className="size-4" />
                    Contact us
                  </a>
                  <a
                    href={feedbackHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm transition-colors hover:border-primary/50"
                  >
                    <MessageSquare className="size-4" />
                    Submit feedback
                  </a>
                </div>
                <p className="mt-5 font-mono text-xs text-muted-foreground">
                  hikehive@team.example
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40">
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
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} HIKEHIVE. All rights reserved.</span>
            <span className="flex items-center gap-2">
              <CalendarClock className="size-3.5" />
              Deadlines change fast — check the feed daily.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
