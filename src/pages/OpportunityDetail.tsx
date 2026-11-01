// Detail page for a single listing: full description, actions, comment thread.
import { AppShell, FullPageLoader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import {
  categoryLabel,
  deadlineLabel,
  domainLabel,
  formatDate,
  modeLabel,
} from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarDays,
  Check,
  ExternalLink,
  MapPin,
  Send,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * The detail page for one listing: full description, meta, actions, and the
 * team's Q&A thread.
 */
export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const opportunity = useQuery(api.opportunities.get, {
    opportunityId: (id ?? undefined) as Id<"opportunities"> | undefined,
  });
  const saves = useQuery(api.saves.listByStudent);
  const applications = useQuery(api.applications.listByStudent);
  const comments = useQuery(api.comments.listByOpportunity, {
    opportunityId: (id ?? undefined) as Id<"opportunities"> | undefined,
  });

  const toggleSave = useMutation(api.saves.toggle);
  const applyToOpportunity = useMutation(api.applications.apply);
  const addComment = useMutation(api.comments.add);

  const [applying, setApplying] = useState(false);
  const [comment, setComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const isStudent = user?.role === "student";
  const savedIds = useMemo(
    () => new Set((saves ?? []).map((s) => s.opportunityId)),
    [saves],
  );
  const myApplication = (applications ?? []).find((a) => a.opportunityId === id);

  if (opportunity === undefined) return <FullPageLoader />;

  if (opportunity === null || id === undefined) {
    return (
      <AppShell>
        <div className="flex flex-col items-center border border-dashed border-border px-6 py-24 text-center">
          <p className="text-lg font-semibold">Opportunity not found</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            It may have been removed by the team, or the link is out of date.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/feed">Back to the feed</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyToOpportunity({ opportunityId: opportunity._id });
      toast.success("Application submitted — track it under My Applications");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply");
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    try {
      const nowSaved = await toggleSave({ opportunityId: opportunity._id });
      toast.success(
        nowSaved ? "Saved to your shortlist" : "Removed from shortlist",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    }
  };

  const handleComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPostingComment(true);
    try {
      await addComment({ opportunityId: opportunity._id, body: comment });
      setComment("");
      toast.success("Comment posted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not post comment",
      );
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <AppShell>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                {categoryLabel(opportunity.category)}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                  opportunity.isOpen
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                {opportunity.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <h1 className="mt-4 text-2xl leading-snug font-semibold tracking-tight sm:text-3xl">
              {opportunity.title}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4" />
              {opportunity.organization}
            </p>

            <p className="mt-6 text-sm leading-7 whitespace-pre-line">
              {opportunity.description}
            </p>

            {opportunity.skills.length > 0 && (
              <div className="mt-6">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <Tag className="size-3.5" />
                  Required skills
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {opportunity.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(opportunity.tags?.length ?? 0) > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Domains
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {opportunity.tags!.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent"
                    >
                      {domainLabel(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-base font-semibold">
              Questions &amp; comments
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {comments?.length ?? 0}
              </span>
            </h2>

            <form onSubmit={handleComment} className="mt-4">
              <label htmlFor="comment" className="text-xs text-muted-foreground">
                Ask the team something about this listing
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Is remote work allowed across time zones?"
                rows={3}
                maxLength={1000}
                className="mt-1.5"
                required
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {comment.length}/1000
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={postingComment || comment.trim().length === 0}
                >
                  <Send className="size-3.5" />
                  {postingComment ? "Posting…" : "Post comment"}
                </Button>
              </div>
            </form>

            <div className="mt-6 flex flex-col divide-y divide-border border-t border-border">
              {(comments ?? []).length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  No comments yet. Be the first to ask something.
                </p>
              ) : (
                (comments ?? []).map((entry) => (
                  <div key={entry._id} className="py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium">{entry.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-6 whitespace-pre-line text-muted-foreground">
                      {entry.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <dl className="flex flex-col gap-4 text-sm">
                <MetaRow
                  icon={<CalendarDays className="size-4 text-primary" />}
                  label="Deadline"
                  value={`${formatDate(opportunity.deadline)} · ${deadlineLabel(opportunity.deadline)}`}
                />
                <MetaRow
                  icon={<MapPin className="size-4 text-primary" />}
                  label="Mode"
                  value={`${modeLabel(opportunity.mode)}${opportunity.location ? ` · ${opportunity.location}` : ""}`}
                />
                <MetaRow
                  icon={<Building2 className="size-4 text-primary" />}
                  label="Eligibility"
                  value={opportunity.eligibility}
                />
                {opportunity.compensation && (
                  <MetaRow
                    icon={<Check className="size-4 text-primary" />}
                    label="Compensation"
                    value={opportunity.compensation}
                  />
                )}
              </dl>

              <div className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
                {isStudent ? (
                  myApplication ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3">
                      <StatusBadge status={myApplication.status} />
                      <Link
                        to="/applications"
                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        Track this application
                      </Link>
                    </div>
                  ) : (
                    <Button
                      className="cta-gradient w-full text-white"
                      disabled={applying || !opportunity.isOpen}
                      onClick={handleApply}
                    >
                      {applying
                        ? "Applying…"
                        : opportunity.isOpen
                          ? "Apply now"
                          : "Applications closed"}
                    </Button>
                  )
                ) : (
                  <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
                    Sign in as a student to apply to listings.
                  </p>
                )}
                {isStudent && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSave}
                  >
                    {savedIds.has(opportunity._id) ? (
                      <>
                        <BookmarkCheck className="size-4 text-accent" />
                        Saved to shortlist
                      </>
                    ) : (
                      <>
                        <Bookmark className="size-4" />
                        Save opportunity
                      </>
                    )}
                  </Button>
                )}
                {opportunity.applyUrl && (
                  <a
                    href={opportunity.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Official application page
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 leading-6">{value}</dd>
      </div>
    </div>
  );
}
