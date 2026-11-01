import { Wordmark } from "@/components/Brand";
import { FullPageLoader } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { GraduationCap, Handshake } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

/**
 * Picking a side of the platform. Shown once after first sign-in and
 * reachable any time from the account menu ("Switch role").
 */
export default function RoleSelect() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const setRole = useMutation(api.roles.setRole);
  const [pending, setPending] = useState<"student" | "recruiter" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <FullPageLoader />;

  const choose = async (role: "student" | "recruiter") => {
    setPending(role);
    setError(null);
    try {
      await setRole({ role });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your role");
      setPending(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="transition-opacity hover:opacity-70"
          >
            <Wordmark />
          </button>
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
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16 sm:px-6">
        <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          Step 1 of 1
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
          Choose your workspace
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Signed in as{" "}
          <span className="text-foreground">{user?.email}</span>. You can
          switch sides at any time from the account menu.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <RoleCard
            icon={<GraduationCap className="size-5" />}
            title="I'm a student"
            description="Browse the opportunity feed, save a shortlist, apply to internships and hackathons, and track every application in one place."
            disabled={pending !== null}
            loading={pending === "student"}
            onClick={() => choose("student")}
          />
          <RoleCard
            icon={<Handshake className="size-5" />}
            title="I'm a recruiter"
            description="Post internships, placement drives, hackathons and workshops, then review applicants and move them through your pipeline."
            disabled={pending !== null}
            loading={pending === "recruiter"}
            onClick={() => choose("recruiter")}
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
      className="group flex flex-col items-start border border-border bg-card p-6 text-left transition-colors hover:border-foreground disabled:opacity-60"
    >
      <span className="flex size-9 items-center justify-center border border-border text-foreground transition-colors group-hover:bg-muted">
        {icon}
      </span>
      <span className="mt-5 text-base font-medium">{title}</span>
      <span className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </span>
      <span className="mt-6 text-[11px] tracking-[0.16em] uppercase text-muted-foreground transition-colors group-hover:text-foreground">
        {loading ? "Setting up…" : "Continue →"}
      </span>
    </button>
  );
}
