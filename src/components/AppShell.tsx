import { Wordmark } from "@/components/Brand";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/opportunities";
import { useConvex } from "convex/react";
import { Loader2, LogOut, Repeat2 } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STUDENT_TABS = [
  { to: "/feed", label: "Feed" },
  { to: "/applications", label: "Applications" },
];

const RECRUITER_TABS = [
  { to: "/postings", label: "Postings" },
  { to: "/applicants", label: "Applicants" },
  { to: "/feed", label: "Browse" },
];

export function FullPageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </main>
  );
}

/**
 * The authenticated shell: sticky minimal header, role-aware navigation and an
 * account menu. Also seeds the demo feed once so a fresh account lands on a
 * browsable platform instead of an empty table.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const convex = useConvex();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    void convex.mutation(api.opportunities.ensureSeed).catch(() => {});
  }, [convex]);

  const isRecruiter = user?.role === "recruiter";
  const tabs = isRecruiter ? RECRUITER_TABS : STUDENT_TABS;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-5 sm:gap-6 sm:px-6">
          <Link
            to="/dashboard"
            className="shrink-0 text-foreground transition-opacity hover:opacity-70"
          >
            <Wordmark />
          </Link>

          <nav className="ml-auto flex min-w-0 items-center gap-4 overflow-x-auto sm:gap-6">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] uppercase transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`size-1 shrink-0 ${isActive ? "bg-foreground" : "bg-transparent"}`}
                    />
                    {tab.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3 border-l border-border pl-4 sm:pl-6">
            <span className="hidden border border-border px-2 py-0.5 text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:inline-block">
              {isRecruiter ? "Recruiter" : "Student"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex size-8 items-center justify-center border border-border bg-background text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {initials(user?.name, user?.email)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email ?? "Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={() => navigate("/role")}
                >
                  <Repeat2 className="mr-2 size-3.5" />
                  Switch role
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 size-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
