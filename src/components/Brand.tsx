/** HIKEHIVE's mark: a 2×2 hive cell grid with a blue→teal gradient. */
export function HiveMark({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="hh-grad"
          x1="0"
          y1="0"
          x2="16"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="oklch(0.62 0.17 262)" />
          <stop offset="100%" stopColor="oklch(0.78 0.11 185)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="6" height="6" fill="url(#hh-grad)" />
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
      <rect x="9" y="9" width="6" height="6" fill="url(#hh-grad)" />
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
      <HiveMark className={markClassName ?? "size-4"} />
      <span className="text-[13px] font-semibold tracking-[0.3em] uppercase">
        Hikehive
      </span>
    </span>
  );
}
