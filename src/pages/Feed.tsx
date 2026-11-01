import { AppShell } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORIES,
  MODES,
  categoryLabel,
  deadlineLabel,
  formatDate,
  modeLabel,
  daysUntil,
} from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ExternalLink,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Opportunity = Doc<"opportunities">;
type SortKey = "deadline" | "newest" | "az";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "deadline", label: "Deadline: soonest" },
  { value: "newest", label: "Recently posted" },
  { value: "az", label: "Title: A–Z" },
];

/**
 * The main screen of HIKEHIVE: the opportunity feed. Search, category and
 * mode filters, sorting, a saved-only view, and detail + apply flow.
 */
export default function Feed() {
  const { user, isLoading: authLoading } = useAuth();
  const opportunities = useQuery(api.opportunities.list);
  const saves = useQuery(api.saves.listByStudent);
  const applications = useQuery(api.applications.listByStudent);
  const toggleSave = useMutation(api.saves.toggle);
  const applyToOpportunity = useMutation(api.applications.apply);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState<SortKey>("deadline");
  const [view, setView] = useState<"all" | "saved">("all");
  const [selected, setSelected] = useState<Opportunity | null>(null);
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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let items = (opportunities ?? []).filter((opportunity) => {
      if (view === "saved" && !savedIds.has(opportunity._id)) return false;
      if (category !== "all" && opportunity.category !== category) return false;
      if (mode !== "all" && opportunity.mode !== mode) return false;
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

    items = [...items].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "newest") return b.createdAt - a.createdAt;
      return a.deadline - b.deadline;
    });
    return items;
  }, [opportunities, search, category, mode, sort, view, savedIds]);

  const closingSoon = filtered.filter((o) => {
    const days = daysUntil(o.deadline);
    return days >= 0 && days <= 7;
  }).length;

  const handleToggleSave = async (opportunityId: Id<"opportunities">) => {
    try {
      const nowSaved = await toggleSave({ opportunityId });
      toast.success(nowSaved ? "Saved to your shortlist" : "Removed from shortlist");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update save");
    }
  };

  const handleApply = async (opportunityId: Id<"opportunities">) => {
    setBusyId(opportunityId);
    try {
      await applyToOpportunity({ opportunityId });
      toast.success("Application submitted — track it under Applications");
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply");
    } finally {
      setBusyId(null);
    }
  };

  if (!authLoading && user && user.role !== "student" && user.role !== "recruiter") {
    return <Navigate to="/role" replace />;
  }

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setMode("all");
    setView("all");
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          {view === "saved" ? "Your shortlist" : "Opportunity feed"}
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
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
      <div className="mt-8 flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center">
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-9 border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            aria-label="Filter by mode"
            className="h-9 border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none"
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
            className="h-9 border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="flex h-9 border border-input">
            {(["all", "saved"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 text-xs tracking-[0.1em] uppercase transition-colors ${
                  view === v
                    ? "bg-foreground text-background"
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
        <div className="mt-16 flex flex-col items-center border border-dashed border-border px-6 py-20 text-center">
          <p className="text-base font-medium">No opportunities match</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {view === "saved"
              ? "Your shortlist is empty. Save opportunities from the feed to find them here."
              : "Try a different search term, or loosen the category and mode filters."}
          </p>
          <Button
            variant="outline"
            className="mt-6 rounded-none"
            onClick={resetFilters}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          {filtered.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity._id}
              opportunity={opportunity}
              index={index}
              isSaved={savedIds.has(opportunity._id)}
              isApplied={appliedByOpportunity.has(opportunity._id)}
              canApply={isStudent}
              busy={busyId === opportunity._id}
              onOpen={() => setSelected(opportunity)}
              onToggleSave={() => handleToggleSave(opportunity._id)}
            />
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-2xl gap-0 rounded-none p-0">
          {selected && (
            <>
              <DialogHeader className="border-b border-border p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                    {categoryLabel(selected.category)}
                  </p>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setSelected(null)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <DialogTitle className="mt-3 text-xl leading-snug font-medium tracking-tight">
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {selected.organization}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[60vh] overflow-y-auto p-6">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-4 border-b border-border pb-6 text-sm sm:grid-cols-2">
                  <MetaItem
                    label="Deadline"
                    value={`${formatDate(selected.deadline)} · ${deadlineLabel(selected.deadline)}`}
                  />
                  <MetaItem
                    label="Mode"
                    value={`${modeLabel(selected.mode)}${selected.location ? ` · ${selected.location}` : ""}`}
                  />
                  {selected.compensation && (
                    <MetaItem label="Compensation" value={selected.compensation} />
                  )}
                  <MetaItem label="Eligibility" value={selected.eligibility} />
                </dl>

                <p className="mt-6 text-sm leading-7 text-foreground">
                  {selected.description}
                </p>

                {selected.skills.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                      Required skills
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.skills.map((skill) => (
                        <span
                          key={skill}
                          className="border border-border px-2 py-1 text-xs text-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-border p-6">
                {isStudent ? (
                  appliedByOpportunity.has(selected._id) ? (
                    <span className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm text-muted-foreground">
                      <Check className="size-4" />
                      Applied —{" "}
                      <Link
                        to="/applications"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        track it
                      </Link>
                    </span>
                  ) : (
                    <Button
                      className="rounded-none"
                      disabled={busyId === selected._id || !selected.isOpen}
                      onClick={() => handleApply(selected._id)}
                    >
                      {busyId === selected._id ? "Applying…" : "Apply now"}
                    </Button>
                  )
                ) : (
                  <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    Recruiter preview — apply as a student
                  </span>
                )}

                {isStudent && (
                  <Button
                    variant="outline"
                    className="rounded-none"
                    onClick={() => handleToggleSave(selected._id)}
                  >
                    {savedIds.has(selected._id) ? (
                      <>
                        <BookmarkCheck className="size-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="size-4" />
                        Save
                      </>
                    )}
                  </Button>
                )}

                {selected.applyUrl && (
                  <a
                    href={selected.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Application page
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function OpportunityCard({
  opportunity,
  index,
  isSaved,
  isApplied,
  canApply,
  busy,
  onOpen,
  onToggleSave,
}: {
  opportunity: Opportunity;
  index: number;
  isSaved: boolean;
  isApplied: boolean;
  canApply: boolean;
  busy: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
}) {
  const days = daysUntil(opportunity.deadline);
  const urgent = days >= 0 && days <= 7;

  return (
    <article className="group border-b border-border py-7 first:border-t">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex w-full shrink-0 items-baseline gap-4 sm:w-40 sm:flex-col sm:gap-2">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {categoryLabel(opportunity.category)}
          </span>
          <span
            className={`text-xs ${urgent ? "text-foreground" : "text-muted-foreground"}`}
          >
            {deadlineLabel(opportunity.deadline)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpen}
            className="block w-full text-left"
          >
            <h2 className="text-lg leading-snug font-medium tracking-tight transition-colors group-hover:text-foreground">
              {opportunity.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {opportunity.organization}
              {opportunity.location ? ` · ${opportunity.location}` : ""} ·{" "}
              {modeLabel(opportunity.mode)}
            </p>
            <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {opportunity.description}
            </p>
          </button>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {opportunity.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {opportunity.skills.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{opportunity.skills.length - 5} more
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-3">
          {canApply &&
            (isApplied ? (
              <Link
                to="/applications"
                className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Check className="size-3.5" />
                Applied
              </Link>
            ) : (
              <Button
                size="sm"
                className="rounded-none"
                disabled={busy || !opportunity.isOpen}
                onClick={onOpen}
              >
                Apply
              </Button>
            ))}
          {canApply && (
            <button
              type="button"
              onClick={onToggleSave}
              aria-label={isSaved ? "Remove from shortlist" : "Save to shortlist"}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {isSaved ? (
                <BookmarkCheck className="size-4" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
