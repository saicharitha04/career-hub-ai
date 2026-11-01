import { STATUSES } from "@/lib/opportunities";
import type { ApplicationStatus } from "@/convex/schema";

/** Near-monochrome status treatments — one inverted accent for milestones. */
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: "border-border bg-muted text-muted-foreground",
  under_review: "border-border bg-background text-foreground",
  shortlisted: "border-foreground/40 bg-background text-foreground",
  interview: "border-foreground bg-foreground text-background",
  selected: "border-foreground bg-foreground text-background",
  rejected:
    "border-border bg-background text-muted-foreground/60 line-through decoration-muted-foreground/50",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const label = STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}
