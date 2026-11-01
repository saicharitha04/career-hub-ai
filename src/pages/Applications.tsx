import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { categoryLabel, deadlineLabel, formatDate } from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import { CalendarClock, Inbox, Loader2, X } from "lucide-react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function formatSlot(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Application tracking for students: every submission with its current
 * pipeline status, any scheduled interview slot, and the ability to withdraw.
 */
export default function Applications() {
  const { user, isLoading: authLoading } = useAuth();
  const applications = useQuery(api.applications.listByStudent);
  const withdraw = useMutation(api.applications.withdraw);

  const handleWithdraw = async (
    applicationId: Id<"applications">,
    title: string,
  ) => {
    try {
      await withdraw({ applicationId });
      toast.success(`Withdrew from ${title}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not withdraw application",
      );
    }
  };

  if (!authLoading && user && user.role === "recruiter") {
    return <Navigate to="/applicants" replace />;
  }

  const active = (applications ?? []).filter(
    (a) => a.status !== "rejected" && a.status !== "selected",
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          Application tracking
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Your applications
          </h1>
          <p className="text-sm text-muted-foreground">
            {applications === undefined
              ? "Loading…"
              : `${applications.length} total · ${active.length} in progress`}
          </p>
        </div>
      </div>

      {applications === undefined ? (
        <div className="mt-10 flex items-center justify-center rounded-2xl border border-border py-24">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
          <Inbox className="size-6 text-muted-foreground" />
          <p className="mt-4 text-base font-semibold">No applications yet</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Browse the feed and apply to an opportunity — it shows up here and
            updates as soon as the recruiter moves it along.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/feed">Browse opportunities</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-3">
          {applications.map((application) => (
            <div
              key={application._id}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                    {categoryLabel(application.opportunity.category)}
                  </p>
                  <Link
                    to={`/opportunities/${application.opportunity._id}`}
                    className="mt-1 block text-base font-semibold tracking-tight transition-colors hover:text-primary"
                  >
                    {application.opportunity.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {application.opportunity.organization} · Applied{" "}
                    {formatDate(application.createdAt)} · Deadline{" "}
                    {formatDate(application.opportunity.deadline)} (
                    {deadlineLabel(application.opportunity.deadline)})
                  </p>

                  {application.status === "interview" &&
                    application.interviewTime && (
                      <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                        <CalendarClock className="size-3.5" />
                        Interview scheduled —{" "}
                        {formatSlot(application.interviewTime)}
                      </p>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <StatusBadge status={application.status} />
                  <button
                    type="button"
                    onClick={() =>
                      handleWithdraw(application._id, application.opportunity.title)
                    }
                    aria-label="Withdraw application"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
