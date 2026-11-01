import { Wordmark } from "@/components/Brand";
import { FullPageLoader } from "@/components/AppShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { GraduationCap, Handshake, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChosenRole = "student" | "recruiter" | "admin";

/**
 * Picking a side of the platform. Shown once after first sign-in and
 * reachable any time from the account menu ("Switch role").
 */
export default function RoleSelect() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const setRole = useMutation(api.roles.setRole);
  const [name, setName] = useState(user?.name ?? "");
  const [pending, setPending] = useState<ChosenRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <FullPageLoader />;

  const choose = async (role: ChosenRole) => {
    if (!name.trim()) {
      setError("Add a display name so teammates know who they're working with.");
      return;
    }
    setPending(role);
    setError(null);
    try {
      await setRole({ role, name: name.trim() });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your role");
      setPending(null);
    }
  };

  return (
    <div className="app-glow flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/60 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="transition-opacity hover:opacity-70"
          >
            <Wordmark />
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-14 sm:px-6">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          One quick step
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Set up your workspace
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{user?.email}</span>.
          Pick how you'll use HIKEHIVE — you can switch sides any time from
          the account menu.
        </p>

        <div className="mt-8 max-w-sm">
          <Label htmlFor="display-name" className="text-xs text-muted-foreground">
            Display name
          </Label>
          <Input
            id="display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ada Lovelace"
            className="mt-1.5"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <RoleCard
            icon={<GraduationCap className="size-5" />}
            title="Student"
            description="Browse the feed, save a shortlist, apply to internships and hackathons, and track every application."
            disabled={pending !== null}
            loading={pending === "student"}
            onClick={() => choose("student")}
          />
          <RoleCard
            icon={<Handshake className="size-5" />}
            title="Recruiter"
            description="Post internships, drives and workshops, then review applicants and move them through your pipeline."
            disabled={pending !== null}
            loading={pending === "recruiter"}
            onClick={() => choose("recruiter")}
          />
          <RoleCard
            icon={<ShieldCheck className="size-5" />}
            title="Administrator"
            description="Manage accounts and listings and watch platform-wide application stats. For the team running HIKEHIVE."
            disabled={pending !== null}
            loading={pending === "admin"}
            onClick={() => choose("admin")}
          />
        </div>

        {error && <p className="mt-6 text-sm text-destructive">{error}</p>}
      </main>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  disabled,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 disabled:opacity-60"
    >
      <span className="flex size-9 items-center justify-center rounded-lg border border-border text-primary transition-colors group-hover:bg-primary/10">
        {icon}
      </span>
      <span className="mt-4 text-base font-semibold">{title}</span>
      <span className="mt-1.5 text-sm leading-6 text-muted-foreground">
        {description}
      </span>
      <span className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Setting up…
          </>
        ) : (
          <>
            Continue
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </>
        )}
      </span>
    </button>
  );
}
