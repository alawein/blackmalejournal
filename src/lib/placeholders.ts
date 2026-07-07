/**
 * Centralized placeholder image paths for content types.
 * All SVGs live in public/placeholders/ and follow BMJ brand identity.
 *
 * Naming convention: /placeholders/{content-type}.svg
 * 
 * @see docs/brand/IMAGE-ASSET-ORGANIZATION.md for full asset documentation
 * @see src/lib/images.ts for logo assets and image utilities
 */

export const PLACEHOLDERS = {
  /** Generic cover — used for OG images and any content type without a specific placeholder */
  cover: '/placeholders/cover.svg',
  /** Article cards and detail pages */
  article: '/placeholders/article.svg',
  /** Briefing magazine covers and cards */
  briefing: '/placeholders/briefing.svg',
  /** Course cards */
  course: '/placeholders/course.svg',
  /** Handbook cards */
  handbook: '/placeholders/handbook.svg',
  /** Dispatch cards */
  dispatch: '/placeholders/dispatch.svg',
  /** Download cards */
  download: '/placeholders/download.svg',
} as const;

export type PlaceholderType = keyof typeof PLACEHOLDERS;

/**
 * Get placeholder image for a content type.
 * Returns the generic cover if type is not found.
 * 
 * @param type - Content type key
 * @returns Placeholder image path
 */
export function getPlaceholder(type: string): string {
  return PLACEHOLDERS[type as PlaceholderType] ?? PLACEHOLDERS.cover;
}
