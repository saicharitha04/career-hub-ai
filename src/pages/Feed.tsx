import { AppShell } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORIES,
  MODES,
  categoryLabel,
  deadlineLabel,
  daysUntil,
  formatDate,
  modeLabel,
} from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Loader2,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SortKey = "deadline" | "newest" | "az";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "deadline", label: "Deadline: soonest" },
  { value: "newest", label: "Recently posted" },
  { value: "az", label: "Title: A–Z" },
];

/**
 * The opportunity feed — the main screen. Search, category/mode/skill
 * filters, sorting, a saved-only view, and quick save/apply actions. Cards
 * open the full detail page.
 */
export default function Feed() {
  const { user, isLoading: authLoading } = useAuth();
  const opportunities = useQuery(api.opportunities.list);
  const saves = useQuery(api.saves.listByStudent);
  const applications = useQuery(api.applications.listByStudent);
  const toggleSave = useMutation(api.saves.toggle);
  const applyToOpportunity = useMutation(api.applications.apply);

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";

  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all");
  const [skill, setSkill] = useState("all");
  const [sort, setSort] = useState<SortKey>("deadline");
  const [view, setView] = useState<"all" | "saved">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const savedIds = useMemo(
    () => new Set((saves ?? []).map((s) => s.opportunityId)),
    [saves],
  );
  const appliedByOpportunity = useMemo(
    () => new Map((applications ?? []).map((a) => [a.opportunityId, a._id])),
    [applications],
  );

  const isStudent = user?.role === "student";

  // Every skill that appears on at least two listings, for the skill filter.
  const skillOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const opportunity of opportunities ?? []) {
      for (const s of opportunity.skills) {
        counts.set(s, (counts.get(s) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 18)
      .map(([s]) => s);
  }, [opportunities]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = (opportunities ?? []).filter((opportunity) => {
      if (view === "saved" && !savedIds.has(opportunity._id)) return false;
      if (categoryParam !== "all" && opportunity.category !== categoryParam)
        return false;
      if (mode !== "all" && opportunity.mode !== mode) return false;
      if (
        skill !== "all" &&
        !opportunity.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
      )
        return false;
      if (!query) return true;
      const haystack = [
        opportunity.title,
        opportunity.organization,
        opportunity.description,
        opportunity.location ?? "",
        ...opportunity.skills,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });

    return [...items].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "newest") return b.createdAt - a.createdAt;
      return a.deadline - b.deadline;
    });
  }, [opportunities, search, categoryParam, mode, skill, sort, view, savedIds]);

  const closingSoon = filtered.filter((o) => {
    const days = daysUntil(o.deadline);
    return days >= 0 && days <= 7;
  }).length;

  const handleToggleSave = async (opportunityId: Id<"opportunities">) => {
    try {
      const nowSaved = await toggleSave({ opportunityId });
      toast.success(
        nowSaved ? "Saved to your shortlist" : "Removed from shortlist",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update save",
      );
    }
  };

  const handleApply = async (opportunityId: Id<"opportunities">) => {
    setBusyId(opportunityId);
    try {
      await applyToOpportunity({ opportunityId });
      toast.success("Application submitted — track it under My Applications");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply");
    } finally {
      setBusyId(null);
    }
  };

  if (
    !authLoading &&
    user &&
    user.role !== "student" &&
    user.role !== "recruiter" &&
    user.role !== "admin"
  ) {
    return <Navigate to="/role" replace />;
  }

  const setCategory = (value: string) => {
    if (value === "all") setSearchParams({});
    else setSearchParams({ category: value });
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setMode("all");
    setSkill("all");
    setView("all");
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          {view === "saved" ? "Your shortlist" : "Opportunity feed"}
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {view === "saved" ? "Saved opportunities" : "Discover opportunities"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {opportunities === undefined
              ? "Loading…"
              : `${filtered.length} of ${opportunities.length} listings`}
            {closingSoon > 0 && view === "all"
              ? ` · ${closingSoon} closing this week`
              : ""}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, organization or skill…"
            className="pl-9"
            aria-label="Search opportunities"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryParam}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            aria-label="Filter by skill"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All skills</option>
            {skillOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            aria-label="Filter by mode"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All modes</option>
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort opportunities"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="flex h-9 rounded-md border border-input">
            {(["all", "saved"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 text-xs font-medium transition-colors ${
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "all" ? "All" : "Saved"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {opportunities === undefined ? (
        <div className="mt-8 flex items-center justify-center border border-border py-24">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
          <p className="text-base font-semibold">No opportunities match</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {view === "saved"
              ? "Your shortlist is empty. Save opportunities from the feed to find them here."
              : "Try a different search term, or loosen the category, skill and mode filters."}
          </p>
          <Button variant="outline" className="mt-6" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {filtered.map((opportunity) => {
            const days = daysUntil(opportunity.deadline);
            const urgent = days >= 0 && days <= 7;
            return (
              <article
                key={opportunity._id}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        {categoryLabel(opportunity.category)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {modeLabel(opportunity.mode)}
                        {opportunity.location
                          ? ` · ${opportunity.location}`
                          : ""}
                      </span>
                      <span
                        className={`text-xs font-medium ${urgent ? "text-accent" : "text-muted-foreground"}`}
                      >
                        · {deadlineLabel(opportunity.deadline)}
                      </span>
                    </div>

                    <Link
                      to={`/opportunities/${opportunity._id}`}
                      className="mt-2 block"
                    >
                      <h2 className="text-lg leading-snug font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {opportunity.title}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {opportunity.organization}
                      </p>
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {opportunity.description}
                      </p>
                    </Link>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {opportunity.skills.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                      {opportunity.skills.length > 5 && (
                        <span className="text-xs text-muted-foreground">
                          +{opportunity.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(opportunity.deadline)}
                    </span>
                    {isStudent &&
                      (appliedByOpportunity.has(opportunity._id) ? (
                        <Link
                          to="/applications"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Check className="size-3.5 text-accent" />
                          Applied
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          disabled={
                            busyId === opportunity._id || !opportunity.isOpen
                          }
                          onClick={() => handleApply(opportunity._id)}
                        >
                          {busyId === opportunity._id
                            ? "Applying…"
                            : "Apply now"}
                        </Button>
                      ))}
                    {isStudent && (
                      <button
                        type="button"
                        onClick={() => handleToggleSave(opportunity._id)}
                        aria-label={
                          savedIds.has(opportunity._id)
                            ? "Remove from shortlist"
                            : "Save to shortlist"
                        }
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {savedIds.has(opportunity._id) ? (
                          <BookmarkCheck className="size-4 text-accent" />
                        ) : (
                          <Bookmark className="size-4" />
                        )}
                      </button>
                    )}
                    <Link
                      to={`/opportunities/${opportunity._id}`}
                      className="hidden items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
                    >
                      Details
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
