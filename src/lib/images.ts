/**
 * Centralized image asset paths and utilities for BMJ.
 * 
 * This module provides type-safe access to all image assets and
 * utility functions for image handling throughout the application.
 */

// ══════════════════════════════════════════════════════════════════════════════
// LOGO ASSETS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Official BMJ logo assets organized by type and variant.
 * 
 * Usage:
 * ```tsx
 * import { LOGOS } from '@/lib/images';
 * <Image src={LOGOS.primary.svg} alt="BMJ Logo" />
 * ```
 */
export const LOGOS = {
  /** Full logo with icon — main brand identifier */
  primary: {
    svg: '/logos/primary-color.svg',
    png: '/logos/primary-color.png',
    light: '/logos/primary-light.png',
  },
  /** Compact horizontal mark */
  submark: {
    svg: '/logos/submark-color.svg',
  },
  /** BMJ letters monogram */
  monogram: {
    svg: '/logos/monogram-color.svg',
  },
  /** Single B letter mark */
  bMark: {
    svg: '/logos/b-mark.svg',
  },
  /** Text-only wordmark */
  wordmark: {
    light: '/logos/wordmark-light.svg', // For dark backgrounds
    dark: '/logos/wordmark-dark.svg',   // For light backgrounds
  },
  /** Favicon variants */
  favicon: {
    default: '/favicon.svg',
    red: '/logos/favicon-red.svg',
  },
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// SOCIAL/SEO ASSETS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Social media and SEO image assets.
 */
export const SOCIAL = {
  /** Default OpenGraph image (1200x630) */
  ogImage: '/og-image.svg',
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// TEXTURE ASSETS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Visual texture assets for brand consistency.
 */
export const TEXTURES = {
  /** Film grain overlay */
  grain: '/textures/grain.svg',
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// IMAGE SIZING PRESETS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Responsive image sizes presets for common layouts.
 * Use with Next.js Image `sizes` prop.
 * 
 * Usage:
 * ```tsx
 * <Image src={src} sizes={IMAGE_SIZES.card} />
 * ```
 */
export const IMAGE_SIZES = {
  /** Full-width hero images */
  hero: '100vw',
  /** Card in 3-column grid */
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  /** Card in 2-column grid */
  cardLarge: '(max-width: 768px) 100vw, 50vw',
  /** Sidebar or narrow column */
  sidebar: '(max-width: 768px) 100vw, 300px',
  /** Thumbnail */
  thumbnail: '(max-width: 640px) 25vw, 120px',
  /** Avatar */
  avatar: '48px',
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// ASPECT RATIOS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Standard aspect ratios used in BMJ design system.
 */
export const ASPECT_RATIOS = {
  /** Standard article/card images */
  wide: '16/9',
  /** Magazine covers, posters */
  portrait: '3/4',
  /** Square avatars, thumbnails */
  square: '1/1',
  /** OpenGraph images */
  og: '1200/630',
  /** Video embeds */
  video: '16/9',
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Get the appropriate logo based on background context.
 * 
 * @param background - 'dark' or 'light' background
 * @param format - 'svg' or 'png'
 * @returns Logo path
 */
export function getLogoForBackground(
  background: 'dark' | 'light' = 'dark',
  format: 'svg' | 'png' = 'svg'
): string {
  if (background === 'light') {
    return format === 'svg' 
      ? LOGOS.wordmark.dark 
      : LOGOS.primary.png;
  }
  return format === 'svg' 
    ? LOGOS.primary.svg 
    : LOGOS.primary.png;
}

/**
 * Get logo dimensions based on logo type.
 * 
 * @param type - Logo type
 * @returns Object with width and height
 */
export function getLogoDimensions(
  type: 'primary' | 'submark' | 'monogram' | 'bMark' | 'wordmark' | 'favicon'
): { width: number; height: number } {
  const dimensions = {
    primary: { width: 280, height: 80 },
    submark: { width: 120, height: 48 },
    monogram: { width: 64, height: 64 },
    bMark: { width: 40, height: 40 },
    wordmark: { width: 200, height: 32 },
    favicon: { width: 32, height: 32 },
  };
  return dimensions[type];
}

/**
 * Generate a blur data URL for image placeholders.
 * Returns a tiny colored SVG as base64 for use with Next.js Image blurDataURL.
 * 
 * @param color - Background color (hex)
 * @returns Base64 encoded SVG data URL
 */
export function generateBlurPlaceholder(color: string = '#1C130E'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect fill="${color}" width="8" height="8"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Check if an image URL is external (not from public folder).
 * 
 * @param src - Image source URL
 * @returns Boolean indicating if external
 */
export function isExternalImage(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}

/**
 * Get optimized image loader configuration for Supabase storage images.
 * 
 * @param src - Supabase storage URL
 * @param width - Desired width
 * @returns Transformed URL with width parameter
 */
export function getSupabaseImageUrl(src: string, width: number): string {
  if (!src.includes('supabase.co/storage')) return src;
  
  // Supabase image transformation
  const url = new URL(src);
  url.searchParams.set('width', String(width));
  url.searchParams.set('quality', '80');
  return url.toString();
}

// ══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export type LogoType = keyof typeof LOGOS;
export type AspectRatio = keyof typeof ASPECT_RATIOS;
export type ImageSizePreset = keyof typeof IMAGE_SIZES;
