'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  GraduationCap,
  PenLine,
  Download,
  BookMarked,
  Users,
  MessageSquare,
  Mail,
  Megaphone,
} from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { BrandMark } from '@/components/brand/BrandMark';

const NAV_ITEMS = [
  { href: PATHS.ADMIN, label: 'Dashboard', icon: LayoutDashboard },
  { href: PATHS.ADMIN_ARTICLES, label: 'Articles', icon: FileText },
  { href: PATHS.ADMIN_BRIEFINGS, label: 'Briefings', icon: BookOpen },
  { href: PATHS.ADMIN_COURSES, label: 'Courses', icon: GraduationCap },
  { href: PATHS.ADMIN_DISPATCHES, label: 'Dispatches', icon: PenLine },
  { href: PATHS.ADMIN_DOWNLOADS, label: 'Downloads', icon: Download },
  { href: PATHS.ADMIN_HANDBOOKS, label: 'Handbooks', icon: BookMarked },
  { href: PATHS.ADMIN_MEMBERS, label: 'Members', icon: Users },
  { href: PATHS.ADMIN_MESSAGES, label: 'Messages', icon: MessageSquare },
  { href: PATHS.ADMIN_SUBSCRIBERS, label: 'Subscribers', icon: Mail },
  { href: PATHS.ADMIN_CAMPAIGNS, label: 'Campaigns', icon: Megaphone },
] as const;

interface AdminNavProps {
  displayName: string;
  role: string;
}

export function AdminNav({ displayName, role }: AdminNavProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === PATHS.ADMIN) return pathname === PATHS.ADMIN;
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-bmj-tan/10 bg-bmj-black">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-bmj-tan/10 px-6 py-5">
        <BrandMark size={24} color="#C0281F" />
        <span className="font-display text-lg tracking-widest text-bmj-white">
          ADMIN
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Admin navigation">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 font-label text-xs uppercase tracking-widest transition-colors ${
                    active
                      ? 'border-l-2 border-bmj-red bg-bmj-red/10 text-bmj-white'
                      : 'border-l-2 border-transparent text-bmj-tan hover:bg-bmj-brown/50 hover:text-bmj-cream'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-bmj-tan/10 px-6 py-4">
        <p className="truncate font-mono text-xs text-bmj-cream">
          {displayName}
        </p>
        <span className="mt-1 inline-block font-label text-micro uppercase tracking-widest text-bmj-tan">
          {role}
        </span>
      </div>
    </aside>
  );
}
