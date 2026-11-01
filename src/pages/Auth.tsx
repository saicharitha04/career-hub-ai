import { Wordmark } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2 } from "lucide-react";
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
 * Sign in / register for HIKEHIVE. One email, one code — no password to
 * remember. Students and recruiters share this flow; the workspace role is
 * chosen right after sign-in.
 */
function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
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
          : "Failed to send verification code. Please try again.",
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
      setError("The verification code you entered is incorrect.");
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
        `Failed to sign in as guest: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="transition-opacity hover:opacity-70"
          >
            <Wordmark />
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Home
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-14">
        <div className="w-full max-w-lg">
          {step === "signIn" ? (
            <div className="border border-border bg-card">
              <div className="border-b border-border p-6 sm:p-8">
                <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                  Sign in · Register
                </p>
                <h1 className="mt-3 text-2xl font-medium tracking-tight">
                  Get Started
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Enter your email to log in or create an account. We&apos;ll
                  send a six-digit code — no password needed.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <div className="p-6 sm:p-8">
                  <label className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                    Email address
                  </label>
                  <div className="mt-2 flex items-stretch gap-2">
                    <Input
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-11 rounded-none"
                      disabled={isLoading}
                      required
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-11 w-11 shrink-0 rounded-none bg-foreground text-background hover:bg-foreground/90"
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
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

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
                    className="mt-6 h-11 w-full rounded-none"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    Continue as guest
                  </Button>

                  <p className="mt-5 text-xs leading-5 text-muted-foreground">
                    Students and recruiters share this flow — you&apos;ll pick
                    your workspace after signing in.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="border border-border bg-card">
              <div className="border-b border-border p-6 sm:p-8">
                <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                  Step 2 of 2
                </p>
                <h1 className="mt-3 text-2xl font-medium tracking-tight">
                  Check your email
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  We&apos;ve sent a six-digit code to{" "}
                  <span className="text-foreground">{step.email}</span>
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
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
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
                    className="mt-6 h-11 w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
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
                      Try again
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
