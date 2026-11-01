import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import {
  categoryLabel,
  deadlineLabel,
  formatDate,
} from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import { Inbox, Loader2, X } from "lucide-react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Application tracking for students: every submission with its current
 * pipeline status, plus the ability to withdraw.
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
        <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          Application tracking
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
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
        <div className="mt-10 flex items-center justify-center border border-border py-24">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-12 flex flex-col items-center border border-dashed border-border px-6 py-20 text-center">
          <Inbox className="size-6 text-muted-foreground" />
          <p className="mt-4 text-base font-medium">No applications yet</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Browse the feed and apply to an opportunity — it will show up here
            with its status as the recruiter reviews it.
          </p>
          <Button asChild variant="outline" className="mt-6 rounded-none">
            <Link to="/feed">Browse opportunities</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 border-t border-border">
          {applications.map((application) => (
            <div
              key={application._id}
              className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {categoryLabel(application.opportunity.category)}
                </p>
                <h2 className="mt-1.5 text-base leading-snug font-medium tracking-tight">
                  {application.opportunity.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.opportunity.organization} · Applied{" "}
                  {formatDate(application.createdAt)} · Deadline{" "}
                  {formatDate(application.opportunity.deadline)} (
                  {deadlineLabel(application.opportunity.deadline)})
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <StatusBadge status={application.status} />
                <button
                  type="button"
                  onClick={() =>
                    handleWithdraw(application._id, application.opportunity.title)
                  }
                  aria-label="Withdraw application"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
