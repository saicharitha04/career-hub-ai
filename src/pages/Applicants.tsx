import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import type { ApplicationStatus } from "@/convex/schema";
import { CalendarClock, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  STATUSES,
  categoryLabel,
  formatDate,
  initials,
  statusLabel,
} from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Recruiter review queue: every application to the recruiter's postings with
 * a pipeline status control.
 */
export default function Applicants() {
  const { user, isLoading: authLoading } = useAuth();
  const applications = useQuery(api.applications.listForRecruiter);
  const setStatus = useMutation(api.applications.setStatus);
  const [searchParams, setSearchParams] = useSearchParams();

  const filterId = searchParams.get("opportunity");
  const isRecruiter = user?.role === "recruiter";
  const loaded = !authLoading && user !== undefined;

  const opportunities = useMemo(() => {
    const map = new Map<string, string>();
    for (const application of applications ?? []) {
      map.set(application.opportunityId, application.opportunity.title);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [applications]);

  const visible = useMemo(() => {
    const list = applications ?? [];
    return filterId ? list.filter((a) => a.opportunityId === filterId) : list;
  }, [applications, filterId]);

  const [slotDrafts, setSlotDrafts] = useState<Record<string, string>>({});

  const handleStatus = async (
    applicationId: Id<"applications">,
    title: string,
    status: ApplicationStatus,
    interviewTime?: number,
  ) => {
    try {
      await setStatus({
        applicationId,
        status,
        interviewTime: status === "interview" ? interviewTime : undefined,
      });
      toast.success(`${title} moved to ${statusLabel(status)}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update status",
      );
    }
  };

  const handleSchedule = async (
    applicationId: Id<"applications">,
    title: string,
  ) => {
    const value = slotDrafts[applicationId];
    if (!value) return;
    await handleStatus(applicationId, title, "interview", new Date(value).getTime());
  };

  if (loaded && !isRecruiter) return <Navigate to="/feed" replace />;

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          Recruiter workspace
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Applicants
          </h1>
          <p className="text-sm text-muted-foreground">
            {applications === undefined
              ? "Loading…"
              : `${visible.length} of ${applications.length} applications`}
          </p>
        </div>
      </div>

      {/* Filter by posting */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border py-4">
        <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Posting
        </span>
        <select
          value={filterId ?? "all"}
          onChange={(e) => {
            const value = e.target.value;
            setSearchParams(value === "all" ? {} : { opportunity: value });
          }}
          aria-label="Filter by opportunity"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All postings</option>
          {opportunities.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        {opportunities.length === 0 && applications !== undefined && (
          <span className="text-sm text-muted-foreground">
            Post an opportunity first —{" "}
            <Link to="/postings" className="underline underline-offset-2">
              go to postings
            </Link>
          </span>
        )}
      </div>

      {applications === undefined ? (
        <div className="mt-10 flex items-center justify-center border border-border py-24">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-12 flex flex-col items-center border border-dashed border-border px-6 py-20 text-center">
          <p className="text-base font-medium">No applications yet</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Once students apply to your postings, they appear here with their
            profile and a status you control.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/postings">Manage postings</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-3">
          {visible.map((application) => (
            <div
              key={application._id}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-[11px] font-medium">
                    {initials(application.student?.name, application.student?.email)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-base leading-snug font-medium tracking-tight">
                      {application.student?.name?.trim() ||
                        application.student?.email?.split("@")[0] ||
                        "Unknown student"}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {application.student?.email ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.opportunity.title} ·{" "}
                      {categoryLabel(application.opportunity.category)} · Applied{" "}
                      {formatDate(application.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={application.status} />
                    <select
                      value={application.status}
                      onChange={(e) =>
                        handleStatus(
                          application._id,
                          application.opportunity.title,
                          e.target.value as ApplicationStatus,
                        )
                      }
                      aria-label="Update application status"
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {application.status === "interview" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                        <CalendarClock className="size-3.5" />
                        {application.interviewTime
                          ? new Date(application.interviewTime).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )
                          : "No slot yet"}
                      </span>
                      <input
                        type="datetime-local"
                        value={slotDrafts[application._id] ?? ""}
                        onChange={(e) =>
                          setSlotDrafts((d) => ({
                            ...d,
                            [application._id]: e.target.value,
                          }))
                        }
                        aria-label="Interview slot"
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        disabled={!slotDrafts[application._id]}
                        onClick={() =>
                          handleSchedule(
                            application._id,
                            application.opportunity.title,
                          )
                        }
                      >
                        Schedule
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
