import { PATHS } from '@/lib/paths';
import { Instagram, Youtube, Linkedin, Twitter, type LucideIcon } from 'lucide-react';

export type NavLink = {
  label: string;
  href: string;
};

/**
 * Header navigation — the 5 primary destinations.
 * Auth CTAs (Log In / Join) are rendered separately by the Navbar component.
 */
export const HEADER_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: PATHS.HOME },
  { label: 'About', href: PATHS.ABOUT },
  { label: 'Academy', href: PATHS.ACADEMY },
  { label: 'Downloads', href: PATHS.DOWNLOADS },
  { label: 'Records', href: PATHS.RECORDS },
];

/**
 * Footer navigation — header links plus utility pages.
 */
export const FOOTER_NAV_LINKS: NavLink[] = [
  ...HEADER_NAV_LINKS,
  { label: 'Contact', href: PATHS.CONTACT },
];

export type SocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Social media links — shared between Footer, MobileMenu, and anywhere else.
 * Update hrefs here when real accounts are created.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'YouTube', href: '#', icon: Youtube },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'Twitter / X', href: '#', icon: Twitter },
];
