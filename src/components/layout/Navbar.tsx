'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { UserDropdown } from './UserDropdown';
import { SearchDialog } from '@/components/ui/SearchDialog';
import { BrandMark } from '@/components/brand/BrandMark';
import { ButtonLink } from '@/components/ui/Button';
import { HEADER_NAV_LINKS } from '@/lib/nav';
import { PATHS } from '@/lib/paths';
import { SCROLL_THRESHOLD_NAV } from '@/lib/constants';
import { SITE_TAGLINE } from '@/lib/seo';
import { cn } from '@/lib/utils';

export type NavUser = {
  email: string;
  displayName?: string;
} | null;

interface NavbarProps {
  user?: NavUser;
}

export function Navbar({ user = null }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD_NAV);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`accent-border-bottom sticky top-0 z-50 transition-[background-color,backdrop-filter] duration-200 ${
          isScrolled
            ? 'bg-bmj-deep-black/95 backdrop-blur-sm'
            : 'bg-bmj-black'
        }`}
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4 lg:py-5">
          {/* Logo / Wordmark */}
          <Link
            href={PATHS.HOME}
            className="flex items-center gap-3 no-underline"
            aria-label="The Black Male Journal — Home"
          >
            <BrandMark size={32} color="var(--bmj-red)" />
            <div className="flex flex-col">
              <span className="font-display text-xl uppercase tracking-wordmark text-bmj-white">
                The Black Male Journal
              </span>
              <span className="hidden xl:block font-label text-micro uppercase tracking-label-lg text-bmj-tan">
                {SITE_TAGLINE}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {HEADER_NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn('nav-link', isActive && 'nav-link-active')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right side — auth-aware */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (Ctrl+K)"
              className="hidden border border-bmj-tan/20 bg-bmj-deep-black/70 p-2 text-bmj-cream transition-[border-color,color,background-color] duration-200 hover:border-bmj-red/50 hover:text-bmj-white lg:block"
            >
              <Search size={18} aria-hidden="true" />
            </button>
            {user ? (
              <div className="hidden sm:block">
                <UserDropdown
                  email={user.email}
                  displayName={user.displayName}
                />
              </div>
            ) : (
              <>
                <Link
                  href={PATHS.LOGIN}
                  className="nav-link hidden sm:block"
                >
                  Log In
                </Link>
                <ButtonLink
                  href={PATHS.SIGNUP}
                  variant="primary"
                  className="hidden sm:inline-flex"
                >
                  Join
                </ButtonLink>
              </>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="border border-bmj-tan/20 bg-bmj-deep-black/70 p-2 text-bmj-cream transition-[border-color,color,background-color] duration-200 hover:border-bmj-red/50 hover:text-bmj-white lg:hidden"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
      />
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
