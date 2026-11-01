// AI Hackathon Matchmaker: local scoring over skills and domain tags.
import { AppShell, FullPageLoader } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import {
  DOMAINS,
  categoryLabel,
  deadlineLabel,
  domainLabel,
} from "@/lib/opportunities";
import { splitList } from "@/lib/resume";
import { useQuery } from "convex/react";
import { ArrowRight, Swords } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Preferences = {
  skills: string;
  domains: string[];
  experience: string;
  team: string;
};

const EXPERIENCES = [
  { value: "beginner", label: "Beginner — first hackathon" },
  { value: "intermediate", label: "Intermediate — a few under my belt" },
  { value: "advanced", label: "Advanced — I ship fast" },
];

const TEAM_PREFERENCES = [
  { value: "solo", label: "Solo" },
  { value: "small", label: "Small team (2–4)" },
  { value: "large", label: "Big team (5+)" },
  { value: "any", label: "Anything works" },
];

/**
 * Hackathon matchmaker: scores open hackathons against the student's skills
 * and chosen domains. Deterministic local scoring, labelled as such.
 */
export default function ToolsHackathons() {
  const profile = useQuery(api.profiles.getOwn);
  const opportunities = useQuery(api.opportunities.list);
  const skillsInputRef = useRef<HTMLInputElement>(null);

  const [domains, setDomains] = useState<string[]>([]);
  const [experience, setExperience] = useState("intermediate");
  const [team, setTeam] = useState("any");
  const [submitted, setSubmitted] = useState<Preferences | null>(null);

  const hackathons = useMemo(
    () =>
      (opportunities ?? []).filter(
        (o) => o.category === "hackathon" && o.isOpen,
      ),
    [opportunities],
  );

  const results = useMemo(() => {
    if (!submitted) return [];
    const mySkills = splitList(submitted.skills).map((s) => s.toLowerCase());
    return hackathons
      .map((hackathon) => {
        const required = hackathon.skills.filter(
          (s) => !s.toLowerCase().includes("any"),
        );
        const matched = required.filter((s) =>
          mySkills.includes(s.toLowerCase()),
        );
        const skillScore =
          required.length === 0 ? 0.75 : matched.length / required.length;

        const tags = hackathon.tags ?? [];
        const domainHits = submitted.domains.filter((d) => tags.includes(d));
        const domainScore =
          submitted.domains.length === 0
            ? 0.5
            : domainHits.length / submitted.domains.length;

        const percent = Math.round(
          (skillScore * 0.55 + domainScore * 0.35 + 0.1 * 0.8) * 100,
        );
        return { hackathon, percent, matched, domainHits, required };
      })
      .sort((a, b) => b.percent - a.percent);
  }, [submitted, hackathons]);

  if (opportunities === undefined || profile === undefined)
    return <FullPageLoader />;

  const toggleDomain = (domain: string) =>
    setDomains((current) =>
      current.includes(domain)
        ? current.filter((d) => d !== domain)
        : [...current, domain],
    );

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          AI tool · Hackathon Matchmaker
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Find your next hackathon
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Tell it what you build with and what you care about; it ranks the
          open hackathons by fit.
        </p>
      </div>

      <p className="mt-6 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <span className="font-medium text-accent">How this works:</span> local
        scoring over skill overlap and domain tags — 55% skills, 35% domains,
        neutral experience weighting. No external AI service is connected yet.
      </p>

      {/* Preferences form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted({
            skills:
              (skillsInputRef.current?.value ?? "") ||
              (profile?.skills ?? []).join(", "),
            domains,
            experience,
            team,
          });
        }}
        className="mt-8 rounded-2xl border border-border bg-card p-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="hm-skills" className="text-xs text-muted-foreground">
              Technical skills (comma separated)
            </Label>
            <Input
              id="hm-skills"
              ref={skillsInputRef}
              defaultValue={(profile?.skills ?? []).join(", ")}
              placeholder="React, Python, Figma, TensorFlow"
              className="mt-1.5"
            />
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Preferred domains</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DOMAINS.map((domain) => (
                <button
                  key={domain.value}
                  type="button"
                  onClick={() => toggleDomain(domain.value)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    domains.includes(domain.value)
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="hm-exp" className="text-xs text-muted-foreground">
              Experience level
            </Label>
            <select
              id="hm-exp"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {EXPERIENCES.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="hm-team" className="text-xs text-muted-foreground">
              Team preference
            </Label>
            <select
              id="hm-team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {TEAM_PREFERENCES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" className="cta-gradient text-white">
            <Swords className="size-4" />
            Find hackathons
          </Button>
        </div>
      </form>

      {/* Results */}
      {submitted ? (
        <div className="mt-10 flex flex-col gap-4">
          <h2 className="text-base font-semibold">
            Recommended for you
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {results.length} hackathon{results.length === 1 ? "" : "s"} ranked
            </span>
          </h2>
          {results.map((result) => (
            <div
              key={result.hackathon._id}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    to={`/opportunities/${result.hackathon._id}`}
                    className="text-base font-semibold transition-colors hover:text-primary"
                  >
                    {result.hackathon.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {result.hackathon.organization} ·{" "}
                    {categoryLabel(result.hackathon.category)} ·{" "}
                    {deadlineLabel(result.hackathon.deadline)}
                  </p>
                </div>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary tabular-nums">
                  {result.percent}% match
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {result.hackathon.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`rounded-full px-2.5 py-0.5 text-xs ${
                      result.matched.includes(skill)
                        ? "bg-accent/15 text-accent"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {(result.hackathon.tags?.length ?? 0) > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Domains:{" "}
                  {result.hackathon.tags!.map(domainLabel).join(" · ")}
                  {result.domainHits.length > 0 &&
                    ` — includes ${result.domainHits.map(domainLabel).join(", ")}`}
                </p>
              )}

              <p className="mt-2 text-xs text-muted-foreground">
                {result.hackathon.eligibility}
              </p>

              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/opportunities/${result.hackathon._id}`}>
                    View details
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
              No open hackathons in the feed right now. Post one from the
              recruiter workspace or check back soon.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          Set your preferences above and hit <b>Find hackathons</b> to see
          ranked matches.
        </p>
      )}
    </AppShell>
  );
}
