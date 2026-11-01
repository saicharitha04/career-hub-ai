import { AppShell } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORIES,
  MODES,
  categoryLabel,
  deadlineLabel,
  formatDate,
  modeLabel,
} from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import { CalendarDays, Loader2, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Recruiter workspace: create opportunities, monitor how each posting is
 * doing, and manage its lifecycle (close, reopen, delete).
 */
export default function Postings() {
  const { user, isLoading: authLoading } = useAuth();
  const postings = useQuery(api.opportunities.listByCreator);
  const applications = useQuery(api.applications.listForRecruiter);
  const create = useMutation(api.opportunities.create);
  const setOpen = useMutation(api.opportunities.setOpen);
  const remove = useMutation(api.opportunities.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: Id<"opportunities">;
    title: string;
  } | null>(null);
  const [minDate, setMinDate] = useState("");

  // Opening the form is an event handler, the right place to compute the
  // earliest selectable deadline (tomorrow) without impure render.
  const openForm = () => {
    setMinDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    );
    setFormOpen(true);
  };

  const isRecruiter = user?.role === "recruiter";
  const loaded = !authLoading && user !== undefined;

  const stats = useMemo(() => {
    const list = postings ?? [];
    const apps = applications ?? [];
    return {
      total: list.length,
      open: list.filter((p) => p.isOpen).length,
      applicants: apps.length,
      shortlisted: apps.filter(
        (a) => a.status === "shortlisted" || a.status === "interview" || a.status === "selected",
      ).length,
    };
  }, [postings, applications]);

  const applicantCount = (opportunityId: Id<"opportunities">) =>
    (applications ?? []).filter((a) => a.opportunityId === opportunityId).length;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const deadlineValue = form.get("deadline") as string;

    try {
      await create({
        title: form.get("title") as string,
        organization: form.get("organization") as string,
        description: form.get("description") as string,
        category: form.get("category") as never,
        skills: (form.get("skills") as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        eligibility: form.get("eligibility") as string,
        mode: form.get("mode") as never,
        location: ((form.get("location") as string) || undefined) ?? undefined,
        deadline: new Date(`${deadlineValue}T23:59:59`).getTime(),
        compensation:
          ((form.get("compensation") as string) || undefined) ?? undefined,
        applyUrl: ((form.get("applyUrl") as string) || undefined) ?? undefined,
      });
      setFormOpen(false);
      toast.success("Opportunity published to the feed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpen = async (
    id: Id<"opportunities">,
    isOpen: boolean,
  ) => {
    try {
      await setOpen({ opportunityId: id, isOpen });
      toast.success(isOpen ? "Opportunity reopened" : "Opportunity closed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove({ opportunityId: deleteTarget.id });
      toast.success("Opportunity deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    }
  };

  if (loaded && !isRecruiter) return <Navigate to="/feed" replace />;

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          Recruiter workspace
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Your postings
          </h1>
          <Button className="rounded-none" onClick={openForm}>
            <Plus className="size-4" />
            New opportunity
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 border border-border sm:grid-cols-4">
        {[
          { label: "Postings", value: stats.total },
          { label: "Open", value: stats.open },
          { label: "Applicants", value: stats.applicants },
          { label: "In pipeline", value: stats.shortlisted },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`p-5 ${i % 2 === 1 ? "border-l border-border" : ""} ${
              i >= 2 ? "border-t border-border sm:border-t-0" : ""
            } ${i === 2 ? "sm:border-l sm:border-border" : ""}`}
          >
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-medium tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Postings list */}
      {postings === undefined ? (
        <div className="mt-10 flex items-center justify-center border border-border py-24">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : postings.length === 0 ? (
        <div className="mt-10 flex flex-col items-center border border-dashed border-border px-6 py-20 text-center">
          <p className="text-base font-medium">No postings yet</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Publish an internship, hackathon, placement drive or workshop and it
            appears in every student&apos;s feed instantly.
          </p>
          <Button className="mt-6 rounded-none" onClick={openForm}>
            <Plus className="size-4" />
            Create your first opportunity
          </Button>
        </div>
      ) : (
        <div className="mt-10 border-t border-border">
          {postings.map((posting) => {
            const closed = !posting.isOpen;
            return (
              <div
                key={posting._id}
                className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                      {categoryLabel(posting.category)}
                    </span>
                    <span
                      className={`border px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase ${
                        closed
                          ? "border-border text-muted-foreground"
                          : "border-foreground/40 text-foreground"
                      }`}
                    >
                      {closed ? "Closed" : "Open"}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-base leading-snug font-medium tracking-tight">
                    {posting.title}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{posting.organization}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDate(posting.deadline)} ·{" "}
                      {deadlineLabel(posting.deadline)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {applicantCount(posting._id)} applicants
                    </span>
                    <span>{modeLabel(posting.mode)}</span>
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-none">
                    <Link
                      to={`/applicants?opportunity=${posting._id}`}
                    >
                      Review applicants
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                    onClick={() => handleToggleOpen(posting._id, !posting.isOpen)}
                  >
                    {posting.isOpen ? "Close" : "Reopen"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none text-muted-foreground"
                    onClick={() =>
                      setDeleteTarget({ id: posting._id, title: posting.title })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New opportunity dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-y-auto rounded-none p-0">
          <DialogHeader className="sticky top-0 border-b border-border bg-background p-6">
            <DialogTitle className="text-xl font-medium tracking-tight">
              New opportunity
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Published to the HIKEHIVE feed for every student to discover.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2">
                <Input
                  name="title"
                  required
                  placeholder="Software Engineering Intern"
                  className="rounded-none"
                />
              </Field>
              <Field label="Organization">
                <Input
                  name="organization"
                  required
                  placeholder="Stripe"
                  className="rounded-none"
                />
              </Field>
              <Field label="Application deadline">
                <Input
                  name="deadline"
                  type="date"
                  required
                  min={minDate}
                  className="rounded-none"
                />
              </Field>
              <Field label="Category">
                <select
                  name="category"
                  required
                  defaultValue="internship"
                  className="h-9 w-full border border-input bg-background px-3 text-sm focus-visible:border-ring focus-visible:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mode">
                <select
                  name="mode"
                  required
                  defaultValue="remote"
                  className="h-9 w-full border border-input bg-background px-3 text-sm focus-visible:border-ring focus-visible:outline-none"
                >
                  {MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Location (optional)">
                <Input
                  name="location"
                  placeholder="Bengaluru / Remote"
                  className="rounded-none"
                />
              </Field>
              <Field label="Compensation (optional)">
                <Input
                  name="compensation"
                  placeholder="₹50,000 / month"
                  className="rounded-none"
                />
              </Field>
              <Field label="Eligibility" className="sm:col-span-2">
                <Input
                  name="eligibility"
                  required
                  placeholder="Pre-final year students, CGPA 7.0+"
                  className="rounded-none"
                />
              </Field>
              <Field
                label="Required skills"
                hint="Comma separated"
                className="sm:col-span-2"
              >
                <Input
                  name="skills"
                  placeholder="Java, SQL, Data Structures"
                  className="rounded-none"
                />
              </Field>
              <Field label="External application link (optional)" className="sm:col-span-2">
                <Input
                  name="applyUrl"
                  type="url"
                  placeholder="https://…"
                  className="rounded-none"
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  name="description"
                  required
                  rows={5}
                  placeholder="What will the selected candidate work on?"
                  className="rounded-none"
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-6">
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-none" disabled={saving}>
                {saving ? "Publishing…" : "Publish opportunity"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="tracking-tight">
              Delete this opportunity?
            </AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” and all applications to it will be
              permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-foreground text-background hover:bg-foreground/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
        {hint && <span className="ml-2 normal-case">( {hint} )</span>}
      </span>
      {children}
    </label>
  );
}
