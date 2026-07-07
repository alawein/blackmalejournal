import { StarDivider } from "@/components/ui/StarDivider";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Page title — rendered as h1 */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional label above the title (e.g., section name) */
  label?: string;
  /** Optional icon rendered before the h1 */
  icon?: React.ReactNode;
  /** className for the StarDivider (default "mb-6") */
  dividerClassName?: string;
  /** className for the outer wrapper */
  className?: string;
  /** Render the title as h1 or h2 */
  as?: "h1" | "h2";
  /** Horizontal alignment */
  align?: "left" | "center";
  /** Visual scale */
  tone?: "page" | "section";
  /** Whether to show the divider */
  showDivider?: boolean;
  /** Whether divider renders above or below content */
  dividerPosition?: "top" | "bottom";
  /** Extra title classes */
  titleClassName?: string;
  /** Extra description classes */
  descriptionClassName?: string;
}

export function PageHeader({
  title,
  description,
  label,
  icon,
  dividerClassName = "mb-6",
  className = "",
  as = "h1",
  align = "left",
  tone = "page",
  showDivider = true,
  dividerPosition = "bottom",
  titleClassName = "",
  descriptionClassName = "",
}: PageHeaderProps) {
  const TitleTag = as;
  const titleClasses = tone === "page" ? "page-title" : "section-title";
  const divider = showDivider ? (
    <StarDivider className={cn(dividerPosition === "top" ? "mb-8" : "", dividerClassName)} />
  ) : null;

  return (
    <header
      className={cn(
        "flex flex-col",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {dividerPosition === "top" && divider}

      {label && (
        <p className="editorial-kicker">
          {label}
        </p>
      )}

      {icon ? (
        <div
          className={cn(
            "mb-2 flex gap-4",
            align === "center"
              ? "flex-col items-center"
              : "flex-col items-start sm:flex-row sm:items-center",
          )}
        >
          {icon}
          <TitleTag className={cn(titleClasses, titleClassName)}>{title}</TitleTag>
        </div>
      ) : (
        <TitleTag className={cn(titleClasses, titleClassName)}>{title}</TitleTag>
      )}

      {description && (
        <p className={cn("editorial-deck mt-3", descriptionClassName)}>
          {description}
        </p>
      )}

      {dividerPosition === "bottom" && divider}
    </header>
  );
}
