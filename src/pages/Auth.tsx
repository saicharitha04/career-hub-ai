import { Wordmark } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

/**
 * Sign in / register for HIKEHIVE. Passwordless by design: one email, one
 * six-digit code. Students, recruiters and admins share this flow; the
 * workspace role is chosen right after sign-in.
 */
function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send the verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("That verification code isn't right. Check it and try again.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Couldn't sign you in as a guest: ${error instanceof Error ? error.message : "unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="app-glow flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/60 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-5">
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
              onClick={() => navigate("/")}
              className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg">
          {step === "signIn" ? (
            <div className="rounded-2xl border border-border bg-card">
              <div className="border-b border-border p-6 sm:p-8">
                <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
                  Welcome to the hive
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                  {mode === "signin"
                    ? "Sign in to HIKEHIVE"
                    : "Create your account"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {mode === "signin"
                    ? "Enter your email and we'll send a six-digit code — no password to remember."
                    : "Same flow whether you're here to find opportunities or post them: email, code, done."}
                </p>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <div className="p-6 sm:p-8">
                  <label
                    htmlFor="auth-email"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Email address
                  </label>
                  <div className="mt-1.5 flex items-stretch gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute top-3 left-3 size-4 text-muted-foreground" />
                      <Input
                        id="auth-email"
                        name="email"
                        type="email"
                        placeholder="you@university.edu"
                        className="h-11 pl-9"
                        disabled={isLoading}
                        required
                        autoFocus
                      />
                    </div>
                    <Button
                      type="submit"
                      size="icon"
                      className="cta-gradient h-11 w-11 shrink-0 text-white"
                      disabled={isLoading}
                      aria-label="Continue"
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowRight className="size-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-3 text-sm text-destructive">{error}</p>
                  )}

                  <div className="mt-6 flex items-center gap-4">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                      Or
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6 h-11 w-full"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    Continue as guest — poke around first
                  </Button>

                  <p className="mt-5 text-xs leading-5 text-muted-foreground">
                    Students, recruiters and admins all sign in here; you'll
                    pick your workspace on the next screen.{" "}
                    <button
                      type="button"
                      onClick={() =>
                        setMode((m) => (m === "signin" ? "register" : "signin"))
                      }
                      className="text-foreground underline underline-offset-2"
                    >
                      {mode === "signin"
                        ? "New here? Create an account"
                        : "Already have one? Sign in"}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card">
              <div className="border-b border-border p-6 sm:p-8">
                <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
                  Step 2 of 2
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                  Check your email
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  We sent a six-digit code to{" "}
                  <span className="font-medium text-foreground">
                    {step.email}
                  </span>
                  . It expires in 15 minutes.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit}>
                <div className="p-6 sm:p-8">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          otp.length === 6 &&
                          !isLoading
                        ) {
                          const form = (e.target as HTMLElement).closest(
                            "form",
                          );
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && (
                    <p className="mt-4 text-center text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="cta-gradient mt-6 h-11 w-full text-white"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify and continue
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                    >
                      Use a different email
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                    >
                      Didn't get it? Try again
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Secured by{" "}
            <a
              href="https://freebuff.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              freebuff.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
