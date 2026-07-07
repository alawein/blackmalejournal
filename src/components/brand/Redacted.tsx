"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RedactedProps {
  children: string;
  className?: string;
  initiallyRevealed?: boolean;
}

export function Redacted({
  children,
  className,
  initiallyRevealed = false,
}: RedactedProps) {
  const [isRevealed, setIsRevealed] = useState(initiallyRevealed);

  return (
    <span
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => !initiallyRevealed && setIsRevealed(false)}
      className={cn(
        "relative inline-block transition-colors duration-300",
        isRevealed ? "text-inherit" : "text-transparent select-none",
        className
      )}
    >
      <span
        className={cn(
          "absolute inset-0 bg-bmj-black transition-transform duration-500 origin-left",
          isRevealed ? "scale-x-0" : "scale-x-100"
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
