import { AppShell, FullPageLoader } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  categoryLabel,
  deadlineLabel,
  displayName,
  formatDate,
  skillOverlap,
} from "@/lib/opportunities";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Bell,
  Bookmark,
  CalendarClock,
  FileSpreadsheet,
  Sparkles,
  Swords,
  Lightbulb,
} from "lucide-react";
import { useMemo } from "react";
import { Link, Navigate } from "react-router";

/**
 * The student dashboard home: a quick read on where things stand — counts,
 * skill-based recommendations, upcoming deadlines and recent notifications.
 */
export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const opportunities = useQuery(api.opportunities.list);
  const saves = useQuery(api.saves.listByStudent);
  const applications = useQuery(api.applications.listByStudent);
  const notifications = useQuery(api.notifications.listOwn);
  const profile = useQuery(api.profiles.getOwn);

  const savedIds = useMemo(
    () => new Set((saves ?? []).map((s) => s.opportunityId)),
    [saves],
  );

  const recommendations = useMemo(() => {
    const skills = profile?.skills ?? [];
    const list = (opportunities ?? []).filter((o) => o.isOpen);
    if (skills.length === 0) {
      return list.slice(0, 3).map((o) => ({ opportunity: o, percent: null }));
    }
    return list
      .map((o) => ({
        opportunity: o,
        percent: skillOverlap(o.skills, skills).percent,
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);
  }, [opportunities, profile]);

  const upcomingDeadlines = useMemo(
    () =>
      [...(opportunities ?? [])]
        .filter((o) => o.isOpen && o.deadline > Date.now())
        .sort((a, b) => a.deadline - b.deadline)
        .slice(0, 5),
    [opportunities],
  );

  if (isLoading) return <FullPageLoader />;
  if (user?.role === "recruiter") return <Navigate to="/postings" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user && user.role !== "student") return <Navigate to="/role" replace />;

  const apps = applications ?? [];
  const activeApps = apps.filter(
    (a) => a.status !== "rejected" && a.status !== "selected",
  );
  const closingSoon = (opportunities ?? []).filter((o) => {
    const days = (o.deadline - Date.now()) / (24 * 60 * 60 * 1000);
    return o.isOpen && days >= 0 && days <= 7;
  }).length;

  const stats = [
    { label: "Total opportunities", value: opportunities?.length ?? "—" },
    { label: "Saved", value: savedIds.size },
    { label: "Applications", value: apps.length },
    { label: "Active", value: activeApps.length },
    { label: "Closing this week", value: closingSoon },
  ];

  return (
    <AppShell>
      <div className="app-glow -mx-4 -mt-10 mb-10 px-4 pt-10 pb-8 sm:-mx-6 sm:px-6">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          Student dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Welcome back, {displayName(user)} 👋
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Here's the state of your search today — what's closing soon, what's
          recommended for you, and where each application stands.
        </p>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recommendations + deadlines */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="size-4 text-accent" />
                Recommended for you
              </h2>
              <Link
                to="/tools/match"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Skill match tool →
              </Link>
            </div>
            {profile?.skills.length === 0 || !profile ? (
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                Add your skills to your{" "}
                <Link to="/profile" className="text-foreground underline underline-offset-2">
                  profile
                </Link>{" "}
                and recommendations are ranked against them. Until then, here
                are the latest listings.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Ranked by overlap with your {profile.skills.length} profile
                skills.
              </p>
            )}
            <div className="mt-4 flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
              {recommendations.map(({ opportunity, percent }) => (
                <Link
                  key={opportunity._id}
                  to={`/opportunities/${opportunity._id}`}
                  className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {opportunity.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {opportunity.organization} ·{" "}
                      {categoryLabel(opportunity.category)}
                    </p>
                  </div>
                  {percent !== null && (
                    <span className="shrink-0 rounded-full border border-accent/40 px-2 py-0.5 text-xs font-medium text-accent tabular-nums">
                      {percent}% match
                    </span>
                  )}
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <CalendarClock className="size-4 text-primary" />
              Upcoming deadlines
            </h2>
            <div className="mt-4 flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
              {upcomingDeadlines.map((opportunity) => (
                <Link
                  key={opportunity._id}
                  to={`/opportunities/${opportunity._id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {opportunity.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(opportunity.deadline)} ·{" "}
                      {categoryLabel(opportunity.category)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-accent">
                    {deadlineLabel(opportunity.deadline)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Notifications + quick actions */}
        <div className="flex flex-col gap-8">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Bell className="size-4 text-primary" />
                Recent notifications
              </h2>
            </div>
            <div className="mt-4 flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
              {(notifications ?? []).length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  Nothing yet — application updates and deadline reminders
                  land here.
                </p>
              ) : (
                (notifications ?? []).slice(0, 5).map((notification) => (
                  <div key={notification._id} className="px-4 py-3">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {notification.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold">Quick actions</h2>
            <div className="mt-4 flex flex-col gap-2">
              {[
                {
                  to: "/feed",
                  icon: Bookmark,
                  label: "Browse the feed",
                  body: "Search, filter and shortlist opportunities",
                },
                {
                  to: "/applications",
                  icon: FileSpreadsheet,
                  label: "Track applications",
                  body: `${activeApps.length} active · ${apps.length} total`,
                },
                {
                  to: "/tools/hackathons",
                  icon: Swords,
                  label: "Hackathon matchmaker",
                  body: "Hackathons scored against your skills",
                },
                {
                  to: "/tools/ideas",
                  icon: Lightbulb,
                  label: "Idea generator",
                  body: "Project ideas by domain and difficulty",
                },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50"
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="size-4 text-accent" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {action.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {action.body}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
