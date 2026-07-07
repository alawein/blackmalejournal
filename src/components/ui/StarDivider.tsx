import { BrandMark } from "@/components/brand/BrandMark";

interface StarDividerProps {
  className?: string;
}

export function StarDivider({ className = "" }: StarDividerProps) {
  return (
    <div
      className={`relative flex items-center py-4 ${className}`}
      role="separator"
      aria-hidden="true"
    >
      {/* Left line */}
      <div className="flex-1 border-t border-bmj-tan/40" />

      {/* Brand mark */}
      <BrandMark size={16} color="var(--bmj-red)" className="mx-3 shrink-0" />

      {/* Right line */}
      <div className="flex-1 border-t border-bmj-tan/40" />
    </div>
  );
}
