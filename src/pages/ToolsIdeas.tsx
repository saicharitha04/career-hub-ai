import { AppShell } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import { DOMAINS } from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import { BookMarked, Lightbulb, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Doc } from "@/convex/_generated/dataModel";

type Idea = {
  title: string;
  description: string;
  problem: string;
  domains: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  technologies: string[];
  features: string[];
  approach: string;
};

/**
 * A curated local library of project ideas. This is honest sample content for
 * version 1 — the generative model ships later with the Python service.
 */
const LIBRARY: Idea[] = [
  {
    title: "Campus Lost & Found",
    description:
      "A campus-wide lost-and-found board where students post found items with photos and location tags, and owners claim them with proof questions.",
    problem:
      "Items lost on campus end up in office drawers because nobody knows where to look or who to ask.",
    domains: ["web", "mobile"],
    difficulty: "Beginner",
    technologies: ["React", "PostgreSQL", "Image hosting"],
    features: ["Photo posts", "Category and location filters", "Claim with proof question", "Email notifications"],
    approach: "CRUD app with image uploads and a simple claim workflow; add geotagged campus locations as a lookup table.",
  },
  {
    title: "Study Buddy Matcher",
    description:
      "Matches students taking the same courses into balanced study groups based on schedule gaps, skills and study style.",
    problem:
      "Students revise alone because there's no easy way to find peers in the same course with compatible availability.",
    domains: ["ai", "web", "education"],
    difficulty: "Beginner",
    technologies: ["React", "Node.js", "PostgreSQL"],
    features: ["Schedule overlap calculator", "Skill-based pairing", "Group chat handoff", "Attendance nudges"],
    approach: "Score pairwise schedule overlap and skill complementarity, then greedy group formation with size caps.",
  },
  {
    title: "Attendance Anomaly Detector",
    description:
      "Flags unusual attendance patterns — sudden drops, chronic last-bench arrivals — so mentors can intervene early.",
    problem: "Academic mentors find out a student is slipping only after the mid-terms.",
    domains: ["data", "ai"],
    difficulty: "Intermediate",
    technologies: ["Python", "Pandas", "scikit-learn", "FastAPI"],
    features: ["Rolling attendance windows", "Anomaly scoring", "Mentor dashboard", "Weekly digest"],
    approach: "Rolling z-scores per student plus isolation-forest on multi-feature records; serve scores through a small API.",
  },
  {
    title: "Placement Prep Tracker",
    description: "Tracks aptitude practice, mock interviews and company-wise readiness with a readiness score per target company.",
    problem: "Prep is scattered across PDFs and spreadsheets with no sense of where you actually stand.",
    domains: ["web", "education"],
    difficulty: "Beginner",
    technologies: ["React", "LocalStorage", "Chart.js"],
    features: ["Company-wise checklists", "Readiness score", "Mock interview log", "Countdown to drive dates"],
    approach: "Client-side tracker with weighted checklists per company; readiness = weighted completion percentage.",
  },
  {
    title: "Railway Query Assistant",
    description: "A multilingual assistant that answers train and route questions from official timetable data instead of PDFs.",
    problem: "Passengers dig through dense timetable PDFs for a single route change.",
    domains: ["ai", "data"],
    difficulty: "Intermediate",
    technologies: ["Python", "FastAPI", "NLP", "React"],
    features: ["Natural-language queries", "Multilingual replies", "Route comparisons", "Delay-aware suggestions"],
    approach: "Parse timetable data into a queryable store, then intent-classify questions and answer from structured lookups.",
  },
  {
    title: "Air Quality Early Warning",
    description: "Combines sensor readings and weather data to warn campus zones when AQI is about to cross unhealthy thresholds.",
    problem: "Outdoor events proceed during poor air quality because warnings arrive after the fact.",
    domains: ["climate", "data"],
    difficulty: "Intermediate",
    technologies: ["Python", "Time-series", "Grafana", "MQTT"],
    features: ["Live AQI map", "Threshold alerts", "48-hour forecasts", "Event recommendations"],
    approach: "Ingest sensor streams, smooth with a short-horizon forecaster, and trigger alerts on predicted threshold crossings.",
  },
  {
    title: "Flood Risk Mapper",
    description: "Interactive city map scoring every street by flood risk from elevation, drainage and historical incident data.",
    problem: "Commuters and authorities both lack a single view of where water will actually rise first.",
    domains: ["climate", "data", "open"],
    difficulty: "Advanced",
    technologies: ["GIS", "Python", "PostGIS", "React"],
    features: ["Risk-graded street map", "Historical incident layers", "Route avoidance", "Crowd-sourced reports"],
    approach: "Weighted overlay of elevation, drainage density and incident history in PostGIS, visualised as a choropleth layer.",
  },
  {
    title: "Crop Disease Detector",
    description: "Snap a photo of a diseased leaf and get a ranked diagnosis with treatment steps, working offline for field use.",
    problem: "Smallholder farmers identify crop disease late, or not at all, without an agronomist nearby.",
    domains: ["ai", "climate"],
    difficulty: "Intermediate",
    technologies: ["Python", "TensorFlow Lite", "Flutter", "OpenCV"],
    features: ["On-device classification", "Treatment guidance", "Offline mode", "Regional crop packs"],
    approach: "Fine-tune a compact CNN on public plant-disease datasets, quantise for phones, and bundle guidance per class.",
  },
  {
    title: "Mental Health Mood Journal",
    description: "A private mood journal that surfaces weekly patterns between sleep, workload and mood without judgement.",
    problem: "Students notice burnout only after it's severe because mood has no visible trend line.",
    domains: ["health", "mobile"],
    difficulty: "Beginner",
    technologies: ["Flutter", "SQLite", "Charts"],
    features: ["Daily check-ins", "Pattern insights", "Private by default", "Gentle nudges"],
    approach: "Local-first storage with weekly aggregation; insights are correlation summaries, never clinical claims.",
  },
  {
    title: "Clinical Trial Match",
    description: "Matches eligible patients to open clinical trials by condition, location and criteria in plain language.",
    problem: "Eligible patients never hear about trials that could help them.",
    domains: ["health", "ai", "data"],
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "FastAPI", "PostgreSQL"],
    features: ["Criteria parsing", "Eligibility scoring", "Trial coordinator dashboard", "Consent tracking"],
    approach: "Parse trial criteria into structured rules, score patient profiles against them, and surface borderline cases for human review.",
  },
  {
    title: "Expense Splitter for Roommates",
    description: "Shared-flat expense tracking with smart settlements that minimise the number of transfers each month.",
    problem: "Flatmate maths devolves into a dozen UPI transfers every month-end.",
    domains: ["finance", "web", "mobile"],
    difficulty: "Beginner",
    technologies: ["React", "Node.js", "SQLite"],
    features: ["Shared ledger", "Minimal-transfer settlement", "Recurring bills", "Monthly summary"],
    approach: "Track balances, then run a greedy settlement that repeatedly clears the largest debtor against the largest creditor.",
  },
  {
    title: "UPI Fraud Pattern Detector",
    description: "Scores UPI transactions for fraud patterns — unusual merchants, burst transfers, new-device payees — in real time.",
    problem: "Fraud is noticed only after money is gone, because checks run in batch overnight.",
    domains: ["finance", "ai", "security"],
    difficulty: "Advanced",
    technologies: ["Python", "Kafka", "scikit-learn", "FastAPI"],
    features: ["Real-time scoring", "Velocity rules", "Explainable flags", "Analyst queue"],
    approach: "Blend deterministic velocity rules with an isolation-forest on behavioural features; every flag carries its top contributing features.",
  },
  {
    title: "Phishing Link Detector",
    description: "A browser extension that warns on lookalike domains and obfuscated URLs before you type anything.",
    problem: "Lookalike domains keep harvesting campus credentials.",
    domains: ["security", "ai"],
    difficulty: "Intermediate",
    technologies: ["TypeScript", "WebExtension API", "ML"],
    features: ["Lookalike-domain detection", "Unicode homograph checks", "Whitelist", "Report button"],
    approach: "Character-level features of the hostname feed a small classifier; deterministic rules catch punycode and homographs first.",
  },
  {
    title: "Passwordless Auth Playground",
    description: "An interactive demo of passkeys and WebAuthn flows teams can actually read and fork.",
    problem: "Teams keep copying JWT snippets without understanding the tradeoffs they're making.",
    domains: ["security", "web", "open"],
    difficulty: "Intermediate",
    technologies: ["TypeScript", "WebAuthn", "Node.js"],
    features: ["Passkey registration demo", "Threat-model comparison", "Copy-paste snippets", "Failure-mode gallery"],
    approach: "Small runnable examples per flow with annotated request/response pairs and an honest comparison table.",
  },
  {
    title: "Smart Energy Dashboard",
    description: "Live hostel energy dashboard that attributes consumption per floor and suggests load shifts to cut bills.",
    problem: "Hostel electricity bills arrive as one opaque number with no levers to pull.",
    domains: ["climate", "data", "cloud"],
    difficulty: "Intermediate",
    technologies: ["Python", "InfluxDB", "Grafana", "MQTT"],
    features: ["Per-floor metering", "Peak detection", "Load-shift suggestions", "Monthly comparisons"],
    approach: "Stream meter readings into a time-series store, detect peaks, and rank shiftable loads by savings per disruption.",
  },
  {
    title: "Accessible Docs Linter",
    description: "CI check that catches accessibility regressions in slides, PDFs and docs before they're published.",
    problem: "Published course material fails basic accessibility checks and nobody notices until a student struggles.",
    domains: ["web", "education", "open"],
    difficulty: "Intermediate",
    technologies: ["TypeScript", "PDF parsing", "CI"],
    features: ["Contrast checks", "Alt-text audit", "Heading structure report", "PR annotations"],
    approach: "Parse documents into a structural tree, run rule checks, and annotate pull requests with concrete fixes.",
  },
  {
    title: "Multilingual Doubt Bot",
    description: "Answers student doubts from lecture notes and textbooks in the language the question was asked in.",
    problem: "Doubt threads go unanswered overnight, and non-English questions get skipped entirely.",
    domains: ["ai", "education"],
    difficulty: "Intermediate",
    technologies: ["Python", "FastAPI", "LLM API", "Vector search"],
    features: ["Retrieval from course notes", "Multilingual replies", "Citation to source pages", "Escalation to TA"],
    approach: "Chunk and embed course material, retrieve top passages per question, and answer with citations plus a human-escalation path.",
  },
  {
    title: "Adaptive Quiz Engine",
    description: "Quizzes that get harder where you're strong and circle back where you're weak, using spaced repetition.",
    problem: "Static question banks waste revision time on already-mastered topics.",
    domains: ["education", "ai"],
    difficulty: "Intermediate",
    technologies: ["React", "TypeScript", "PostgreSQL"],
    features: ["Difficulty adaptation", "Spaced repetition", "Per-topic mastery", "Exportable reports"],
    approach: "Track per-topic correctness and recency; pick the next question by expected information gain within a spaced-repetition window.",
  },
  {
    title: "Transit Crowd Predictor",
    description: "Predicts crowd levels for campus shuttles and city routes so riders can leave ten minutes later.",
    problem: "Everyone arrives at the stop at once because nobody knows which bus is about to be packed.",
    domains: ["data", "ai"],
    difficulty: "Advanced",
    technologies: ["Python", "Time-series", "FastAPI", "Maps"],
    features: ["Crowd-level forecast", "Stop-level heat map", "Rider notifications", "Operator view"],
    approach: "Gradient-boosted model over historical ridership, calendar and weather features, refreshed per route every few minutes.",
  },
  {
    title: "E-Waste Marketplace",
    description: "A verified marketplace where labs list working surplus hardware and students or NGOs claim it at scrap-adjusted prices.",
    problem: "Functional laptops and boards sit in cupboards while clubs buy the same gear new.",
    domains: ["open", "climate", "web"],
    difficulty: "Beginner",
    technologies: ["React", "PostgreSQL", "Image uploads"],
    features: ["Condition verification flow", "Claim queue", "Pickup scheduling", "Impact stats"],
    approach: "Listings with verification photos and a first-come claim queue plus admin override for NGO requests.",
  },
  {
    title: "Local Hackathon Volunteer Ops",
    description: "Volunteer scheduling, judge routing and room capacity for hackathon day, built for organisers on a budget.",
    problem: "Hackathon day runs on spreadsheets and shouted instructions across venues.",
    domains: ["open", "web"],
    difficulty: "Beginner",
    technologies: ["React", "SQLite", "QR codes"],
    features: ["Shift scheduler", "Judge routing", "Room capacity board", "QR check-in"],
    approach: "Shift-based roster with coverage warnings plus a QR check-in that feeds a live capacity board.",
  },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
const TECH_OPTIONS = [
  "React",
  "TypeScript",
  "Python",
  "FastAPI",
  "Node.js",
  "Flutter",
  "PostgreSQL",
  "Machine Learning",
  "Cloud",
];

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Idea Generator: filters a curated library by domain and difficulty, ordered
 * deterministically per query so repeated clicks are stable until you
 * regenerate. Save favourites to your collection.
 */
export default function ToolsIdeas() {
  const savedIdeas = useQuery(api.ideas.listOwn);
  const saveIdea = useMutation(api.ideas.save);
  const removeIdea = useMutation(api.ideas.remove);

  const [domain, setDomain] = useState("ai");
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState<string>("Intermediate");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [counter, setCounter] = useState(0);
  const [generated, setGenerated] = useState<Idea[] | null>(null);
  const [savingTitle, setSavingTitle] = useState<string | null>(null);

  const generate = () => {
    const seed = `${domain}-${difficulty}-${theme.trim()}-${counter}`;
    let pool = LIBRARY.filter((idea) => idea.domains.includes(domain));
    if (pool.length < 4) {
      pool = [...pool, ...LIBRARY.filter((idea) => !idea.domains.includes(domain))];
    }
    const byDifficulty = pool.filter((idea) => idea.difficulty === difficulty);
    const finalPool = byDifficulty.length >= 3 ? byDifficulty : pool;
    const ranked = [...finalPool]
      .sort(
        (a, b) =>
          stableHash(a.title + seed) - stableHash(b.title + seed),
      )
      .slice(0, 4);
    setGenerated(ranked);
    setCounter((c) => c + 1);
  };

  const handleSave = async (idea: Idea) => {
    setSavingTitle(idea.title);
    try {
      await saveIdea({
        title: idea.title,
        description: idea.description,
        problem: idea.problem,
        domain,
        difficulty: idea.difficulty,
        technologies: idea.technologies,
        features: idea.features,
        approach: idea.approach,
      });
      toast.success(`Saved “${idea.title}”`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSavingTitle(null);
    }
  };

  const handleRemove = async (idea: Doc<"savedIdeas">) => {
    try {
      await removeIdea({ ideaId: idea._id });
      toast.success("Idea removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove");
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          AI tool · Idea Generator
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Project ideas, on demand
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Pick a domain and a difficulty; get project briefs with a problem
          statement, suggested tech and a build approach.
        </p>
      </div>

      <p className="mt-6 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <span className="font-medium text-accent">How this works:</span> ideas
        come from a curated library written by the team, filtered by your
        picks — honest v1 sample content. The generative model arrives with the
        Python service.
      </p>

      {/* Generator form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
        className="mt-8 rounded-2xl border border-border bg-card p-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="ig-domain" className="text-xs text-muted-foreground">
              Project domain
            </Label>
            <select
              id="ig-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="ig-difficulty" className="text-xs text-muted-foreground">
              Difficulty
            </Label>
            <select
              id="ig-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="ig-theme" className="text-xs text-muted-foreground">
              Hackathon theme or twist (optional)
            </Label>
            <Input
              id="ig-theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. must work offline, ₹0 budget, rural deployment"
              className="mt-1.5"
            />
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">
              Preferred technologies
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TECH_OPTIONS.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() =>
                    setTechnologies((t) =>
                      t.includes(tech)
                        ? t.filter((x) => x !== tech)
                        : [...t, tech],
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    technologies.includes(tech)
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {generated && (
            <Button
              type="button"
              variant="outline"
              onClick={generate}
            >
              <RefreshCw className="size-4" />
              Regenerate
            </Button>
          )}
          <Button type="submit" className="cta-gradient text-white">
            <Lightbulb className="size-4" />
            Generate ideas
          </Button>
        </div>
      </form>

      {/* Generated ideas */}
      {generated && (
        <div className="mt-10 flex flex-col gap-4">
          <h2 className="text-base font-semibold">
            Ideas for {DOMAINS.find((d) => d.value === domain)?.label} ·{" "}
            {difficulty}
          </h2>
          {generated.map((idea) => (
            <div
              key={idea.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <Sparkles className="size-4 shrink-0 text-accent" />
                    {idea.title}
                  </h3>
                  <span className="mt-1 inline-block rounded-full border border-border px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
                    {idea.difficulty}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={savingTitle === idea.title}
                  onClick={() => handleSave(idea)}
                >
                  <BookMarked className="size-4" />
                  {savingTitle === idea.title ? "Saving…" : "Save idea"}
                </Button>
              </div>

              <p className="mt-4 text-sm leading-6">{idea.description}</p>

              <div className="mt-4">
                <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  Problem statement
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {idea.problem}
                </p>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                    Suggested technologies
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {idea.technologies.map((tech) => (
                      <span
                        key={tech}
                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                          technologies.some(
                            (t) => t.toLowerCase() === tech.toLowerCase(),
                          )
                            ? "bg-accent/15 text-accent"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                    Main features
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                    {idea.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  Implementation approach
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {idea.approach}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved ideas */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <BookMarked className="size-4 text-primary" />
          Saved ideas
          <span className="text-sm font-normal text-muted-foreground">
            {(savedIdeas ?? []).length}
          </span>
        </h2>
        <div className="mt-4 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {(savedIdeas ?? []).length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nothing saved yet. Generate ideas above and keep the ones worth
              building.
            </p>
          ) : (
            (savedIdeas ?? []).map((idea) => (
              <div
                key={idea._id}
                className="flex items-start justify-between gap-4 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{idea.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {idea.description}
                  </p>
                  <p className="mt-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                    {idea.domain} · {idea.difficulty}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idea)}
                  aria-label="Remove saved idea"
                  className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
