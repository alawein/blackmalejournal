function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

type WCAGLevel = 'AA' | 'AA-large' | 'AAA' | 'AAA-large';

const THRESHOLDS: Record<WCAGLevel, number> = {
  'AA': 4.5, 'AA-large': 3, 'AAA': 7, 'AAA-large': 4.5,
};

export function meetsWCAG(fg: string, bg: string, level: WCAGLevel): boolean {
  return contrastRatio(fg, bg) >= THRESHOLDS[level];
}
