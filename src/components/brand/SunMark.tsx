import { cn } from "@/lib/utils";

type SunMarkProps = {
  className?: string;
};

/** Stylized rising-sun mark used on sign-in and sidebar. */
export function SunMark({ className }: SunMarkProps) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-accent", className)}
      aria-hidden
    >
      <path
        d="M4 28h40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M8 28a16 16 0 0 1 32 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 4v5M10 10l3.5 3.5M38 10l-3.5 3.5M6 20h5M37 20h5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
