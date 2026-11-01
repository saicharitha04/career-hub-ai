import { AppShell, FullPageLoader } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import { skillOverlap } from "@/lib/opportunities";
import { uploadToStorage } from "@/lib/resume";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowRight, Loader2, Sparkles, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * Resume-to-internship matching. Scores every open internship against the
 * skills on the student's profile using deterministic skill-overlap
 * arithmetic — clearly labelled, not an external AI service.
 */
export default function ToolsMatch() {
  const profile = useQuery(api.profiles.getOwn);
  const opportunities = useQuery(api.opportunities.list);
  const upsert = useMutation(api.profiles.upsert);
  const generateUploadUrl = useAction(api.files.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const mySkills = useMemo(() => profile?.skills ?? [], [profile]);

  const matches = useMemo(() => {
    return (opportunities ?? [])
      .filter((o) => o.isOpen && o.category === "internship")
      .map((opportunity) => ({
        opportunity,
        ...skillOverlap(opportunity.skills, mySkills),
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [opportunities, mySkills]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const storageId = await uploadToStorage(file, generateUploadUrl);
      await upsert({
        skills: mySkills,
        interests: profile?.interests ?? [],
        headline: profile?.headline,
        phone: profile?.phone,
        education: profile?.education,
        graduationYear: profile?.graduationYear,
        goals: profile?.goals,
        resumeName: file.name,
        resumeSize: file.size,
        resumeStorageId: storageId,
      });
      toast.success(`Resume uploaded — ${file.name}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed — try again",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (profile === undefined || opportunities === undefined)
    return <FullPageLoader />;

  const bestMatch = matches[0];

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          AI tool · Skill Match
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Resume-to-internship match
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Every open internship scored against the skills on your profile —
          with the matched skills, the gaps, and what to learn next.
        </p>
      </div>

      {/* Method note */}
      <p className="mt-6 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <span className="font-medium text-accent">How this works:</span> v1
        scores skill overlap between your profile and each listing's required
        skills — deterministic arithmetic, no external AI service connected
        yet. The full NLP resume parser ships with the Python service.
      </p>

      {/* Inputs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Your skills ({mySkills.length})
          </p>
          {mySkills.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No skills on your profile yet.{" "}
              <Link to="/profile" className="text-foreground underline underline-offset-2">
                Add them
              </Link>{" "}
              to unlock matching.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {mySkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          <Link
            to="/profile"
            className="mt-4 inline-block text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Edit skills →
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Resume
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {profile?.resumeName
              ? `Uploaded: ${profile.resumeName}`
              : "PDF or DOCX. Your resume is stored with your profile and shown to recruiters."}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                {profile?.resumeName ? "Replace resume" : "Upload resume"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Best match highlight */}
      {bestMatch && mySkills.length > 0 && (
        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="size-4" />
            Best match right now
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{bestMatch.opportunity.title}</p>
              <p className="text-sm text-muted-foreground">
                {bestMatch.opportunity.organization} · {bestMatch.percent}% match
              </p>
            </div>
            <Button asChild size="sm">
              <Link to={`/opportunities/${bestMatch.opportunity._id}`}>
                View details
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Ranked list */}
      <div className="mt-10 flex flex-col gap-4">
        <h2 className="text-base font-semibold">
          All internships, ranked
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {matches.length} listings
          </span>
        </h2>
        {matches.map((match) => (
          <div
            key={match.opportunity._id}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  to={`/opportunities/${match.opportunity._id}`}
                  className="text-base font-semibold transition-colors hover:text-primary"
                >
                  {match.opportunity.title}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {match.opportunity.organization}
                </p>
              </div>
              <span className="text-2xl font-semibold text-primary tabular-nums">
                {match.percent}%
              </span>
            </div>

            <Progress value={match.percent} className="mt-4 h-2" />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] tracking-[0.14em] text-accent uppercase">
                  Matching skills
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {match.matched.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      None yet — add more skills to your profile
                    </span>
                  ) : (
                    match.matched.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  Missing skills
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {match.missing.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      You cover everything listed 🎉
                    </span>
                  ) : (
                    match.missing.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {match.missing.length > 0 && (
              <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                To strengthen this match, add {match.missing.slice(0, 3).join(", ")}{" "}
                to your profile — or start with a {match.missing[0]} course from
                the Skill Programs in the feed.
              </p>
            )}
          </div>
        ))}
        {matches.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            No open internships in the feed right now. Check back soon.
          </p>
        )}
      </div>
    </AppShell>
  );
}
