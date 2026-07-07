'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';
import { HEADER_NAV_LINKS, SOCIAL_LINKS } from '@/lib/nav';
import { PATHS } from '@/lib/paths';
import { Button, ButtonLink } from '@/components/ui/Button';
import type { NavUser } from './Navbar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: NavUser;
}

export function MobileMenu({ isOpen, onClose, user = null }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.nav
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col overflow-y-auto overscroll-contain bg-bmj-black px-8 py-6"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="mb-10 self-end border border-bmj-tan/20 bg-bmj-deep-black/70 p-2 text-bmj-cream transition-[border-color,color,background-color] duration-200 hover:border-bmj-red/50 hover:text-bmj-white"
            >
              <X size={28} aria-hidden="true" />
            </button>

            {/* Nav links */}
            <ul className="flex flex-1 flex-col gap-6">
              {HEADER_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                  href={link.href}
                  onClick={onClose}
                  className="font-display text-5xl uppercase tracking-wordmark text-bmj-white transition-colors hover:text-bmj-red"
                >
                  {link.label}
                </Link>
                </li>
              ))}
              {user && (
                <li>
                  <Link
                    href={PATHS.PORTAL}
                    onClick={onClose}
                    className="font-display text-5xl uppercase tracking-wordmark text-bmj-amber transition-colors hover:text-bmj-red"
                  >
                    Portal
                  </Link>
                </li>
              )}
            </ul>

            {/* Auth CTA */}
            {user ? (
              <form action={signOut} className="mb-8">
                <Button
                  type="submit"
                  variant="secondary"
                  fullWidth
                >
                  Log Out
                </Button>
              </form>
            ) : (
              <div className="mb-8 flex flex-col gap-3">
                <ButtonLink
                  href={PATHS.SIGNUP}
                  variant="primary"
                  fullWidth
                >
                  Join
                </ButtonLink>
                <ButtonLink
                  href={PATHS.LOGIN}
                  variant="secondary"
                  fullWidth
                >
                  Log In
                </ButtonLink>
              </div>
            )}

            {/* Socials */}
            <div className="flex gap-6 pb-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-bmj-tan transition-colors hover:text-bmj-cream"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={20} aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
