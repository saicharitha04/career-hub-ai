import { AppShell, FullPageLoader } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import type { Role } from "@/convex/schema";
import { useAuth } from "@/hooks/use-auth";
import { categoryLabel, formatDate } from "@/lib/opportunities";
import { useMutation, useQuery } from "convex/react";
import {
  ShieldCheck,
  Trash2,
  Users as UsersIcon,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_ORDER = [
  "applied",
  "under_review",
  "shortlisted",
  "interview",
  "selected",
  "rejected",
] as const;

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "recruiter", label: "Recruiter" },
  { value: "admin", label: "Admin" },
];

/**
 * Administrator workspace: platform statistics, application pipeline
 * breakdown, account management and opportunity management.
 */
export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const stats = useQuery(api.admin.stats);
  const users = useQuery(api.admin.listUsers);
  const opportunities = useQuery(api.opportunities.list);
  const setUserRole = useMutation(api.admin.setUserRole);
  const removeUser = useMutation(api.admin.removeUser);
  const setOpen = useMutation(api.opportunities.setOpen);
  const removeOpportunity = useMutation(api.opportunities.remove);

  const [pendingUser, setPendingUser] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await setUserRole({ userId: userId as never, role });
      toast.success("Role updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    }
  };

  const handleRemoveUser = async () => {
    if (!pendingUser) return;
    try {
      await removeUser({ userId: pendingUser.id as never });
      toast.success(`Removed ${pendingUser.label}`);
      setPendingUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove");
    }
  };

  const handleToggleOpen = async (id: string, isOpen: boolean) => {
    try {
      await setOpen({ opportunityId: id as never, isOpen });
      toast.success(isOpen ? "Opportunity reopened" : "Opportunity closed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    }
  };

  const handleRemoveOpportunity = async (id: string) => {
    try {
      await removeOpportunity({ opportunityId: id as never });
      toast.success("Opportunity deleted");
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    }
  };

  if (authLoading) return <FullPageLoader />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const maxStatus = Math.max(
    1,
    ...STATUS_ORDER.map((s) => stats?.byStatus?.[s] ?? 0),
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          Administrator workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Platform control
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Everything on HIKEHIVE at a glance — accounts, listings and the
          application pipeline.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { icon: UsersIcon, label: "Students", value: stats?.students ?? "—" },
          {
            icon: UsersIcon,
            label: "Recruiters",
            value: stats?.recruiters ?? "—",
          },
          { icon: ShieldCheck, label: "Admins", value: stats?.admins ?? "—" },
          {
            icon: Briefcase,
            label: "Opportunities",
            value: stats?.opportunities ?? "—",
          },
          {
            icon: Briefcase,
            label: "Open now",
            value: stats?.openOpportunities ?? "—",
          },
          {
            icon: MessageSquare,
            label: "Comments",
            value: stats?.comments ?? "—",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <stat.icon className="size-4 text-primary" />
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {stat.value}
            </p>
            <p className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Pipeline */}
        <section className="lg:col-span-1">
          <h2 className="text-base font-semibold">Applications by status</h2>
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4">
              {STATUS_ORDER.map((status) => {
                const count = stats?.byStatus?.[status] ?? 0;
                return (
                  <div key={status}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="capitalize">
                        {status.replace("_", " ")}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          status === "rejected"
                            ? "bg-muted-foreground/40"
                            : status === "selected"
                              ? "cta-gradient"
                              : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.max((count / maxStatus) * 100, count > 0 ? 6 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
              {stats?.applications ?? 0} applications in total across the
              platform.
            </p>
          </div>
        </section>

        {/* Users */}
        <section className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <UsersIcon className="size-4 text-primary" />
            Accounts
            <span className="text-sm font-normal text-muted-foreground">
              {users?.length ?? 0}
            </span>
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Applications</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((account) => (
                  <tr
                    key={account._id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {account.name?.trim() ||
                          account.email?.split("@")[0] ||
                          "Unnamed"}
                        {account.isSelf && (
                          <Badge
                            variant="outline"
                            className="ml-2 border-accent/40 text-[9px] text-accent"
                          >
                            you
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account.email ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={account.role}
                        disabled={account.isSelf}
                        onChange={(e) =>
                          handleRoleChange(account._id, e.target.value as Role)
                        }
                        aria-label="Change role"
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                        {account.role !== "student" &&
                          account.role !== "recruiter" &&
                          account.role !== "admin" && (
                            <option value={account.role}>
                              {account.role}
                            </option>
                          )}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(account.createdAt)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {account.applicationCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {account.isSelf ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            setPendingUser({
                              id: account._id,
                              label:
                                account.name?.trim() ||
                                account.email ||
                                "this account",
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {(users ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No accounts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Opportunities management */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Briefcase className="size-4 text-primary" />
          Opportunities
          <span className="text-sm font-normal text-muted-foreground">
            {opportunities?.length ?? 0}
          </span>
        </h2>
        <div className="mt-4 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {(opportunities ?? []).map((opportunity) => (
            <div
              key={opportunity._id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {opportunity.title}
                  <span
                    className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] tracking-wide uppercase ${
                      opportunity.isOpen
                        ? "border-accent/40 text-accent"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {opportunity.isOpen ? "Open" : "Closed"}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {opportunity.organization} ·{" "}
                  {categoryLabel(opportunity.category)} · deadline{" "}
                  {formatDate(opportunity.deadline)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleToggleOpen(opportunity._id, !opportunity.isOpen)
                  }
                >
                  {opportunity.isOpen ? "Close" : "Reopen"}
                </Button>
                {deleteConfirmId === opportunity._id ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveOpportunity(opportunity._id)}
                  >
                    Confirm delete
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteConfirmId(opportunity._id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {(opportunities ?? []).length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No opportunities yet.
            </p>
          )}
        </div>
      </section>

      {/* Remove-user confirmation */}
      {pendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
            <h3 className="text-base font-semibold">Remove this account?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pendingUser.label} and everything they own — postings,
              applications, saved items and ideas — will be permanently
              deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPendingUser(null)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemoveUser}>
                Remove account
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
