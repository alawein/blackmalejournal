import { cn } from "@/lib/utils";

interface StampProps {
  children: string;
  variant?: "red" | "black";
  className?: string;
  rotation?: number;
}

export function Stamp({
  children,
  variant = "red",
  className,
  rotation = -12,
}: StampProps) {
  return (
    <div
      className={cn(
        "inline-block border-[3px] px-3 py-1 font-display text-2xl uppercase tracking-wider",
        variant === "red"
          ? "border-bmj-red text-bmj-red"
          : "border-bmj-deep-black text-bmj-deep-black",
        className
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity: 0.85,
      }}
    >
      {children}
    </div>
  );
}
