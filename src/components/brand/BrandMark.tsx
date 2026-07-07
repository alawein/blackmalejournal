/**
 * The BMJ brand mark — star with fountain pen nib.
 * Used inline in nav, footer, dividers, and as watermark.
 * Traced from the designer's favicon mark.
 *
 * Design decisions:
 * - The pen nib is always --bmj-deep-black (#1C130E), regardless of the color prop.
 *   This preserves the two-tone mark identity at any size.
 * - The nib hole is always --bmj-white (#F2EDE4), never raw CSS white.
 * - The star body takes the color prop.
 *
 * Props:
 * - size: width/height in pixels (default 32)
 * - color: star body fill color (default "currentColor")
 * - className: additional Tailwind classes
 */
interface BrandMarkProps {
  size?: number;
  color?: string;
  className?: string;
}

export function BrandMark({ size = 32, color = "currentColor", className = "" }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Pen nib — always deep-black, part of mark identity */}
      <path
        d="M50 0 C45 15, 38 20, 35 28 L50 22 L65 28 C62 20, 55 15, 50 0Z"
        fill="#1C130E"
      />
      {/* Nib hole — always bmj-white, never raw white */}
      <circle cx="50" cy="18" r="3" fill="#F2EDE4" />
      {/* Five-pointed star body — takes color prop */}
      <path
        d="M50 28 L61 58 L95 58 L67 74 L78 100 L50 82 L22 100 L33 74 L5 58 L39 58 Z"
        fill={color}
      />
    </svg>
  );
}
