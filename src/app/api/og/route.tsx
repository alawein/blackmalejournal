import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// ── Brand tokens (inlined — edge runtime cannot read `src/styles/brand.css`) ──

const COLORS = {
  black: '#0D0C0B',
  deepBlack: '#1C130E',
  cream: '#E8DCC8',
  red: '#C0281F',
  amber: '#C8852A',
  tan: '#B8986A',
  olive: '#416100',
  purple: '#554978',
  white: '#F2EDE4',
  paper: '#F0DDBC',
} as const;

const LENS_ACCENTS: Record<string, string> = {
  politics: COLORS.red,
  health: COLORS.amber,
  culture: COLORS.tan,
  entertainment: COLORS.purple,
  business: COLORS.olive,
};

type OgType = 'article' | 'briefing' | 'dispatch' | 'handbook' | 'course' | 'default';
type OgVariant = 'default' | 'intel' | 'manifesto';

const TYPE_LABELS: Record<OgType, string> = {
  article: 'Article',
  briefing: 'Weekend Briefing',
  dispatch: 'Dispatch',
  handbook: 'Handbook',
  course: 'Academy',
  default: 'The Black Male Journal',
};

function resolveType(raw: string | null): OgType {
  if (!raw) return 'default';
  const normalized = raw.toLowerCase();
  if (normalized === 'article' || normalized === 'briefing' || normalized === 'dispatch' ||
      normalized === 'handbook' || normalized === 'course') {
    return normalized;
  }
  return 'default';
}

/**
 * Dynamic OpenGraph image endpoint.
 *
 * Query parameters:
 * - `title` — required. The headline rendered on the card.
 * - `type` — optional. Content kind for the small kicker label.
 * - `lens` — optional. Drives the accent bar color.
 * - `author` — optional. Byline at the bottom.
 *
 * Example: `/api/og?title=On%20Discipline&type=article&lens=health&author=The%20Chairman`
 */
export async function GET(request: NextRequest) {
  try {
    // `request.nextUrl` exposes a synchronous Web URL — the Next.js 16 async
    // searchParams contract applies to Page/Layout props, not route handlers.
    const query = request.nextUrl.searchParams;
    const title = (query.get('title') ?? 'The Black Male Journal').slice(0, 140);
    const type = resolveType(query.get('type'));
    const lens = query.get('lens')?.toLowerCase() ?? '';
    const author = query.get('author') ?? 'The Chairman';
    const variant = (query.get('variant') ?? 'default') as OgVariant;

    const accent = LENS_ACCENTS[lens] ?? COLORS.red;
    const kicker = TYPE_LABELS[type];

    if (variant === 'intel') {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: COLORS.paper,
              color: COLORS.deepBlack,
              fontFamily: 'monospace',
              padding: '60px 80px',
              position: 'relative',
            }}
          >
            {/* Intel Stamp */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 40,
                border: `4px solid ${COLORS.red}`,
                padding: '8px 16px',
                color: COLORS.red,
                fontSize: 24,
                fontWeight: 900,
                transform: 'rotate(-10deg)',
                textTransform: 'uppercase',
              }}
            >
              Strictly Confidential
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', borderBottom: `2px solid rgba(28, 19, 14, 0.1)`, paddingBottom: 20, marginBottom: 40 }}>
              <span style={{ fontSize: 16, fontWeight: 700, opacity: 0.6, letterSpacing: 2 }}>INTEL BRIEFING // BMJ-A-001</span>
              <span style={{ fontSize: 14, opacity: 0.4 }}>DATE: APRIL 20, 2026</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 12, opacity: 0.5 }}>SUBJECT:</div>
              <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 700, textTransform: 'uppercase' }}>{title}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid rgba(28, 19, 14, 0.1)`, paddingTop: 20 }}>
              <span style={{ fontSize: 14, opacity: 0.4 }}>OFFICIAL CORRESPONDENCE</span>
              <span style={{ fontSize: 14, opacity: 0.4 }}>THE CHAIRMAN // BMJ</span>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    if (variant === 'manifesto') {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: COLORS.black,
              color: COLORS.cream,
              fontFamily: 'sans-serif',
              padding: '80px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', width: 100, height: 2, background: COLORS.red, marginBottom: 40 }} />
            <div
              style={{
                fontSize: 96,
                lineHeight: 1,
                fontWeight: 900,
                textTransform: 'uppercase',
                maxWidth: 1000,
                marginBottom: 40,
              }}
            >
              {title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 40, height: 1, background: COLORS.tan }} />
              <span style={{ fontSize: 20, letterSpacing: 10, textTransform: 'uppercase', color: COLORS.tan }}>BMJ</span>
              <div style={{ width: 40, height: 1, background: COLORS.tan }} />
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: COLORS.black,
          color: COLORS.cream,
          fontFamily: 'sans-serif',
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 12,
            background: accent,
          }}
        />

        {/* Brand row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              background: COLORS.red,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.white,
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: COLORS.cream,
              fontWeight: 600,
            }}
          >
            The Black Male Journal
          </div>
        </div>

        {/* Kicker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 40,
              height: 3,
              background: accent,
            }}
          />
          <span
            style={{
              fontSize: 20,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: accent,
              fontWeight: 600,
            }}
          >
            {kicker}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: -1,
            color: COLORS.white,
            textTransform: 'uppercase',
            maxWidth: 1040,
            flex: 1,
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `2px solid ${COLORS.tan}`,
            paddingTop: 20,
            marginTop: 40,
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: COLORS.tan,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {author}
          </span>
          <span
            style={{
              fontSize: 16,
              color: COLORS.tan,
              fontStyle: 'italic',
            }}
          >
            Speak the Truth. Navigate the Consequences.
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
    );
  } catch (error) {
    console.error('[og/route] Failed to generate OG image', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
