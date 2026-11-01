import { AppShell, FullPageLoader } from "@/components/AppShell";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { formatFileSize, splitList, uploadToStorage } from "@/lib/resume";
import { useAction, useMutation, useQuery } from "convex/react";
import { FileText, Loader2, Save, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Profile management: contact and education details, skills and interests the
 * match tools score against, goals, and the resume upload. Inputs are
 * uncontrolled — values come from the resolved profile at mount and are read
 * back from the form on save.
 */
export default function Profile() {
  const { user } = useAuth();
  const profile = useQuery(api.profiles.getOwn);
  const upsert = useMutation(api.profiles.upsert);
  const setName = useMutation(api.profiles.setName);
  const generateUploadUrl = useAction(api.files.generateUploadUrl);

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (profile === undefined) return <FullPageLoader />;

  const readForm = () => {
    const fd = new FormData(formRef.current!);
    return {
      headline: (fd.get("headline") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      education: (fd.get("education") as string) || undefined,
      graduationYear: (fd.get("graduationYear") as string) || undefined,
      skills: splitList((fd.get("skills") as string) ?? ""),
      interests: splitList((fd.get("interests") as string) ?? ""),
      goals: ((fd.get("goals") as string) || undefined) ?? undefined,
      name: ((fd.get("name") as string) ?? "").trim(),
    };
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const values = readForm();
    try {
      await Promise.all([
        upsert({
          headline: values.headline,
          phone: values.phone,
          education: values.education,
          graduationYear: values.graduationYear,
          skills: values.skills,
          interests: values.interests,
          goals: values.goals,
          resumeName: profile?.resumeName,
          resumeSize: profile?.resumeSize,
          resumeStorageId: profile?.resumeStorageId,
        }),
        values.name && values.name !== user?.name
          ? setName({ name: values.name })
          : Promise.resolve(),
      ]);
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Keep resumes under 10 MB");
      return;
    }
    setUploading(true);
    try {
      const values = readForm();
      const storageId = await uploadToStorage(file, generateUploadUrl);
      await upsert({
        headline: values.headline,
        phone: values.phone,
        education: values.education,
        graduationYear: values.graduationYear,
        skills: values.skills,
        interests: values.interests,
        goals: values.goals,
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

  const handleRemoveResume = async () => {
    try {
      const values = readForm();
      await upsert({
        headline: values.headline,
        phone: values.phone,
        education: values.education,
        graduationYear: values.graduationYear,
        skills: values.skills,
        interests: values.interests,
        goals: values.goals,
      });
      toast.success("Resume removed from your profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
          Your profile
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile &amp; resume
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          The skills and interests you list here are what the Skill Match and
          Hackathon Matchmaker score opportunities against — the more precise
          they are, the better the rankings.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <form ref={formRef} onSubmit={handleSave} className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-base font-semibold">About you</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Display name">
                <Input
                  name="name"
                  defaultValue={user?.name ?? ""}
                  placeholder="Ada Lovelace"
                  required
                />
              </Field>
              <Field label="Headline">
                <Input
                  name="headline"
                  defaultValue={profile?.headline ?? ""}
                  placeholder="Third-year CSE · backend and systems"
                />
              </Field>
              <Field label="Email">
                <Input value={user?.email ?? ""} disabled />
              </Field>
              <Field label="Phone">
                <Input
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="+91 …"
                />
              </Field>
              <Field label="Education">
                <Input
                  name="education"
                  defaultValue={profile?.education ?? ""}
                  placeholder="B.Tech, Computer Science"
                />
              </Field>
              <Field label="Graduation year">
                <Input
                  name="graduationYear"
                  defaultValue={profile?.graduationYear ?? ""}
                  placeholder="2027"
                />
              </Field>
              <Field
                label="Technical skills"
                hint="comma separated"
                className="sm:col-span-2"
              >
                <Input
                  name="skills"
                  defaultValue={(profile?.skills ?? []).join(", ")}
                  placeholder="Java, SQL, Data Structures, React"
                />
              </Field>
              <Field
                label="Interests"
                hint="comma separated"
                className="sm:col-span-2"
              >
                <Input
                  name="interests"
                  defaultValue={(profile?.interests ?? []).join(", ")}
                  placeholder="Backend, cloud, developer tooling"
                />
              </Field>
              <Field label="Career goals" className="sm:col-span-2">
                <Textarea
                  name="goals"
                  defaultValue={profile?.goals ?? ""}
                  rows={3}
                  placeholder="What are you aiming for in the next year?"
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="size-4" />
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </div>
        </form>

        {/* Resume */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Resume</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              PDF or DOCX, up to 10 MB. Stored securely in project storage with
              your profile.
            </p>

            {profile?.resumeName ? (
              <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {profile.resumeName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {profile.resumeSize
                        ? formatFileSize(profile.resumeSize)
                        : "Uploaded"}{" "}
                      · ready for matching
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    aria-label="Remove resume"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
                <Upload className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  No resume yet. Upload one so recruiters see it alongside your
                  applications.
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
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
      </div>
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
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-xs text-muted-foreground">
        {label}
        {hint && (
          <span className="ml-1.5 text-[10px] normal-case opacity-70">
            ({hint})
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}
