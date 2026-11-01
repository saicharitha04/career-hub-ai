/** HIKEHIVE's mark: a 2×2 hive cell grid. Reads at 14px and at 64px. */
export function HiveMark({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="6" height="6" fill="currentColor" />
      <rect
        x="9.5"
        y="1.5"
        width="5"
        height="5"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="1.5"
        y="9.5"
        width="5"
        height="5"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

/** Wordmark with the mark, used in every header. */
export function Wordmark({
  className = "",
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <HiveMark className={markClassName ?? "size-3.5"} />
      <span className="text-[13px] font-semibold tracking-[0.3em]">
        HIKEHIVE
      </span>
    </span>
  );
}
