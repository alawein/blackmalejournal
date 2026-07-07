import { cn } from "@/lib/utils";

interface KickerProps {
  children: React.ReactNode;
  className?: string;
}

export function Kicker({ children, className }: KickerProps) {
  return (
    <span
      className={cn(
        "font-label text-stamp uppercase tracking-label-max text-bmj-tan",
        "flex items-center gap-2",
        className
      )}
    >
      {children}
    </span>
  );
}
