import type {
  ApplicationStatus,
  OpportunityCategory,
  OpportunityMode,
} from "@/convex/schema";

/** The six opportunity categories in the HIKEHIVE feed. */
export const CATEGORIES: { value: OpportunityCategory; label: string }[] = [
  { value: "internship", label: "Internship" },
  { value: "hackathon", label: "Hackathon" },
  { value: "placement", label: "Placement Drive" },
  { value: "exam", label: "Competitive Exam" },
  { value: "skill", label: "Skill Program" },
  { value: "workshop", label: "Workshop" },
];

export const MODES: { value: OpportunityMode; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

export const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function modeLabel(value: string): string {
  return MODES.find((m) => m.value === value)?.label ?? value;
}

export function statusLabel(value: string): string {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(timestamp: number): number {
  return Math.ceil((timestamp - Date.now()) / (24 * 60 * 60 * 1000));
}

/** Human phrasing for a deadline, e.g. "Closes in 5 days". */
export function deadlineLabel(timestamp: number): string {
  const days = daysUntil(timestamp);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

export function initials(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function displayName(user: { name?: string; email?: string } | null | undefined): string {
  if (!user) return "";
  return user.name?.trim() || user.email?.split("@")[0] || "there";
}
