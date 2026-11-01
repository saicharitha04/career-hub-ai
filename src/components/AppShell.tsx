import { Wordmark } from "@/components/Brand";
import { NotificationsBell } from "@/components/NotificationsBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/opportunities";
import { useConvex } from "convex/react";
import {
  Bookmark,
  ChevronDown,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Repeat2,
  Sparkles,
  Swords,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/feed", label: "Opportunities" },
  { to: "/feed?category=internship", label: "Internships" },
  { to: "/feed?category=hackathon", label: "Hackathons" },
  { to: "/applications", label: "My Applications", studentOnly: true },
];

const AI_TOOLS = [
  { to: "/tools/match", label: "Skill Match", icon: Sparkles },
  { to: "/tools/hackathons", label: "Hackathon Matchmaker", icon: Swords },
  { to: "/tools/ideas", label: "Idea Generator", icon: Lightbulb },
];

export function FullPageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </main>
  );
}

/**
 * The authenticated shell: sticky header with the full HIKEHIVE navigation,
 * theme toggle, notifications and account menu. Also seeds the demo feed once
 * so a fresh account lands on a browsable platform.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const convex = useConvex();
  const seeded = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    void convex.mutation(api.opportunities.ensureSeed).catch(() => {});
  }, [convex]);

  const role = user?.role;
  const isRecruiter = role === "recruiter";
  const isAdmin = role === "admin";
  const isStudent = role === "student";

  const cta = isAdmin
    ? { label: "Admin panel", to: "/admin" }
    : isRecruiter
      ? { label: "New posting", to: "/postings" }
      : { label: "Explore opportunities", to: "/feed" };

  const isActive = (to: string) =>
    `${location.pathname}${location.search}` === to ||
    (location.pathname + location.search === to.split("?")[0] &&
      !to.includes("?"));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = NAV_ITEMS.filter((item) => !item.studentOnly || isStudent);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            to="/dashboard"
            className="shrink-0 text-foreground transition-opacity hover:opacity-70"
          >
            <Wordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                  isActive(item.to)
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  AI Tools
                  <ChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1.5">
                {AI_TOOLS.map((tool) => (
                  <DropdownMenuItem
                    key={tool.to}
                    className="cursor-pointer rounded-md text-sm"
                    onClick={() => navigate(tool.to)}
                  >
                    <tool.icon className="mr-2 size-4 text-accent" />
                    {tool.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {isAdmin && (
              <Link
                to="/admin"
                className={`rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                  isActive("/admin")
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-[11px] font-medium text-foreground transition-colors hover:border-primary/50"
                >
                  {initials(user?.name, user?.email)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email ?? "Account"}
                  <span className="mt-0.5 block text-[10px] tracking-widest uppercase">
                    {isAdmin ? "Administrator" : isRecruiter ? "Recruiter" : "Student"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-md text-sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-md text-sm"
                  onClick={() => navigate("/profile")}
                >
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-md text-sm"
                  onClick={() => navigate(isStudent ? "/applications" : "/postings")}
                >
                  <Bookmark className="mr-2 size-4" />
                  {isStudent ? "My applications" : "My postings"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-md text-sm"
                  onClick={() => navigate("/role")}
                >
                  <Repeat2 className="mr-2 size-4" />
                  Switch role
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-md text-sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to={cta.to}
              className="cta-gradient hidden rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:inline-flex"
            >
              {cta.label}
            </Link>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden"
                >
                  {mobileOpen ? (
                    <X className="size-4" />
                  ) : (
                    <Menu className="size-4" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="mt-6 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive(item.to)
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <p className="mt-4 px-3 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    AI Tools
                  </p>
                  {AI_TOOLS.map((tool) => (
                    <Link
                      key={tool.to}
                      to={tool.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <tool.icon className="mr-2 size-4 text-accent" />
                      {tool.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Admin panel
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/role"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Switch role
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign out
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
