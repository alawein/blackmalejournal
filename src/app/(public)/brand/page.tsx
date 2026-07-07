// src/app/(public)/brand/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Image as ImageIcon, FileText, Palette, Type } from "lucide-react";

export const metadata: Metadata = {
  title: "Brand Identity System",
  description: "Black Male Journal brand identity and visual system showcase.",
};

const CORE_COLORS = [
  { name: "BMJ Red", variable: "--bmj-red", hex: "#C0281F", usage: "Primary accent, CTAs, ideological emphasis" },
  { name: "BMJ Black", variable: "--bmj-black", hex: "#0D0C0B", usage: "Primary backgrounds, typography" },
  { name: "BMJ Cream", variable: "--bmj-cream", hex: "#E8DCC8", usage: "Paper tone, secondary backgrounds" },
  { name: "BMJ White", variable: "--bmj-white", hex: "#F2EDE4", usage: "Text on dark, card backgrounds" },
];

const SECONDARY_COLORS = [
  { name: "BMJ Amber", variable: "--bmj-amber", hex: "#C8852A", usage: "Health/Wellness accent" },
  { name: "BMJ Brown", variable: "--bmj-brown", hex: "#3B2417", usage: "Deep editorial grounds" },
  { name: "BMJ Tan", variable: "--bmj-tan", hex: "#B8986A", usage: "Muted text, borders, metadata" },
];

const ACCENT_COLORS = [
  { name: "Olive", variable: "--bmj-olive", hex: "#416100", lens: "Health/Wellness" },
  { name: "Crimson", variable: "--bmj-crimson", hex: "#712414", lens: "Politics/Law" },
  { name: "Medium Brown", variable: "--bmj-medium-brown", hex: "#5D3F2E", lens: "Culture/Ideology" },
  { name: "Purple", variable: "--bmj-purple", hex: "#554978", lens: "Entertainment/Tech" },
  { name: "Gold", variable: "--bmj-gold", hex: "#C77A0E", lens: "Business/Finance" },
];

const TYPE_SCALE = [
  { name: "Display 1", size: "72px", weight: "400", font: "Bebas Neue", use: "Hero headlines" },
  { name: "Display 2", size: "48px", weight: "400", font: "Bebas Neue", use: "Section titles" },
  { name: "Display 3", size: "36px", weight: "400", font: "Bebas Neue", use: "Card titles" },
  { name: "Heading 1", size: "28px", weight: "700", font: "Libre Baskerville", use: "Article H1" },
  { name: "Heading 2", size: "24px", weight: "700", font: "Libre Baskerville", use: "Article H2" },
  { name: "Body", size: "17px", weight: "400", font: "Libre Baskerville", use: "Article text" },
  { name: "Label", size: "13px", weight: "500", font: "Oswald", use: "Buttons, nav" },
  { name: "Mono", size: "13px", weight: "400", font: "IBM Plex Mono", use: "Code, timestamps" },
];

function ColorSwatch({ name, hex, usage, large = false }: { name: string; hex: string; usage?: string; large?: boolean }) {
  return (
    <div className={`flex ${large ? "flex-col" : "items-center gap-4"}`}>
      <div
        className={`${large ? "h-24 w-full mb-3" : "h-12 w-12 shrink-0"} border border-bmj-tan/20`}
        style={{ backgroundColor: hex }}
      />
      <div className={large ? "" : "flex-1"}>
        <p className="font-label text-sm uppercase tracking-label text-bmj-white">{name}</p>
        <p className="font-mono text-xs text-bmj-tan">{hex}</p>
        {usage && <p className="mt-1 text-xs text-bmj-cream/60">{usage}</p>}
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-bmj-tan/20 py-16 scroll-mt-24">
      <h2 className="section-title mb-8">{title}</h2>
      {children}
    </section>
  );
}

export default function BrandPage() {
  return (
    <div className="page-shell py-16">
      {/* Hero */}
      <header className="mb-16 border-b border-bmj-tan/20 pb-16">
        <p className="editorial-kicker mb-4">Brand Identity System</p>
        <h1 className="page-title mb-6">The Black Male Journal</h1>
        <p className="editorial-deck">
          A visual identity system rooted in revolutionary print culture: militant typography, posterized portraiture, and tactile newspaper textures to communicate 
          ideological clarity, Pan-African consciousness, and unapologetic Black male intellectual authority.
        </p>
        <p className="mt-8 font-label text-sm uppercase tracking-label-lg text-bmj-tan">
          Speak the Truth. Navigate the Consequences.
        </p>

        {/* Quick Links */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link 
            href="/brand/images" 
            className="group flex items-center gap-4 rounded border border-bmj-tan/20 bg-bmj-black/30 p-4 transition-colors hover:border-bmj-red/50 hover:bg-bmj-black/50"
          >
            <ImageIcon className="h-8 w-8 text-bmj-red" />
            <div>
              <p className="font-label text-sm uppercase tracking-label text-bmj-white group-hover:text-bmj-red">Image Assets</p>
              <p className="text-xs text-bmj-cream/60">Logos, placeholders, textures</p>
            </div>
          </Link>
          <Link 
            href="/brand/movement-literature" 
            className="group flex items-center gap-4 rounded border border-bmj-tan/20 bg-bmj-black/30 p-4 transition-colors hover:border-bmj-white/50 hover:bg-bmj-black/50"
          >
            <FileText className="h-8 w-8 text-bmj-white" />
            <div>
              <p className="font-label text-sm uppercase tracking-label text-bmj-white group-hover:text-bmj-white">Literature Spec</p>
              <p className="text-xs text-bmj-cream/60">Documents and presentations</p>
            </div>
          </Link>
          <Link 
            href="#color-system" 
            className="group flex items-center gap-4 rounded border border-bmj-tan/20 bg-bmj-black/30 p-4 transition-colors hover:border-bmj-amber/50 hover:bg-bmj-black/50"
          >
            <Palette className="h-8 w-8 text-bmj-amber" />
            <div>
              <p className="font-label text-sm uppercase tracking-label text-bmj-white group-hover:text-bmj-amber">Color System</p>
              <p className="text-xs text-bmj-cream/60">Palettes and usage</p>
            </div>
          </Link>
          <Link 
            href="#typography-system" 
            className="group flex items-center gap-4 rounded border border-bmj-tan/20 bg-bmj-black/30 p-4 transition-colors hover:border-bmj-tan/50 hover:bg-bmj-black/50"
          >
            <Type className="h-8 w-8 text-bmj-tan" />
            <div>
              <p className="font-label text-sm uppercase tracking-label text-bmj-white group-hover:text-bmj-tan">Typography</p>
              <p className="text-xs text-bmj-cream/60">Fonts and type scale</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Brand Attributes */}
      <Section title="Brand Attributes">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { attr: "Militant", desc: "Disciplined, forceful, serious, prepared for intellectual struggle" },
            { attr: "Confrontational", desc: "Declarative, unsoftened, ideologically direct and positioned" },
            { attr: "Print-Born", desc: "Material, tactile, textured—closer to pamphlet than polished app" },
            { attr: "Masculine", desc: "Weighty, restrained, structured, unsentimental gravitas" },
            { attr: "Pan-African", desc: "Historically literate, movement-conscious, globally Black" },
            { attr: "Doctrinal", desc: "Organized around clear positions, not neutral aggregation" },
            { attr: "Authoritative", desc: "Journal-like, composed, hierarchical, archival, accountable" },
            { attr: "Uncompromising", desc: "Not optimized for comfort, appeasement, or trend aesthetics" },
          ].map(({ attr, desc }) => (
            <div key={attr} className="surface-panel p-6">
              <h3 className="mb-2 font-display text-2xl uppercase tracking-display text-bmj-red">{attr}</h3>
              <p className="text-sm leading-relaxed text-bmj-cream/80">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Logo System */}
      <Section title="Logo System">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Primary Wordmark */}
          <div className="surface-panel-strong p-8">
            <p className="editorial-kicker mb-4">Primary Wordmark</p>
            <div className="mb-6 flex items-center justify-center bg-bmj-black p-8">
              <h2 className="font-display text-4xl uppercase tracking-wordmark text-bmj-white md:text-5xl">
                The Black Male Journal
              </h2>
            </div>
            <p className="text-sm text-bmj-cream/70">
              Full wordmark for primary applications. Use on dark backgrounds with adequate clear space.
              Minimum width: 200px for digital, 2 inches for print.
            </p>
          </div>

          {/* Submark */}
          <div className="surface-panel-strong p-8">
            <p className="editorial-kicker mb-4">Monogram / Submark</p>
            <div className="mb-6 flex items-center justify-center gap-8 bg-bmj-black p-8">
              <div className="flex h-20 w-20 items-center justify-center border-2 border-bmj-red">
                <span className="font-display text-4xl uppercase tracking-tight text-bmj-white">BMJ</span>
              </div>
              <div className="flex h-16 w-16 items-center justify-center bg-bmj-red">
                <span className="font-display text-3xl uppercase tracking-tight text-bmj-white">B</span>
              </div>
            </div>
            <p className="text-sm text-bmj-cream/70">
              Compact marks for favicons, social avatars, and small applications. 
              Maintains recognition at 16px minimum.
            </p>
          </div>
        </div>

        {/* Logo Variants */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center justify-center bg-bmj-black p-6 border border-bmj-tan/20">
            <span className="font-display text-xl uppercase tracking-wordmark text-bmj-red">BMJ</span>
            <span className="mt-2 font-mono text-xs text-bmj-tan">Primary on Black</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-bmj-cream p-6 border border-bmj-tan/20">
            <span className="font-display text-xl uppercase tracking-wordmark text-bmj-black">BMJ</span>
            <span className="mt-2 font-mono text-xs text-bmj-brown">On Cream</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-bmj-red p-6 border border-bmj-tan/20">
            <span className="font-display text-xl uppercase tracking-wordmark text-bmj-white">BMJ</span>
            <span className="mt-2 font-mono text-xs text-bmj-white/70">Reversed on Red</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-bmj-deep-black p-6 border border-bmj-tan/20">
            <span className="font-display text-xl uppercase tracking-wordmark text-bmj-cream">BMJ</span>
            <span className="mt-2 font-mono text-xs text-bmj-tan">On Deep Black</span>
          </div>
        </div>
      </Section>

      {/* Color System */}
      <Section id="color-system" title="Color System">
        {/* Core Palette */}
        <div className="mb-12">
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Core Palette</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_COLORS.map((color) => (
              <ColorSwatch key={color.name} {...color} large />
            ))}
          </div>
        </div>

        {/* Secondary Palette */}
        <div className="mb-12">
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Secondary Palette</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {SECONDARY_COLORS.map((color) => (
              <ColorSwatch key={color.name} {...color} large />
            ))}
          </div>
        </div>

        {/* Sectional Accents */}
        <div>
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Sectional Accents (Lens Colors)</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ACCENT_COLORS.map((color) => (
              <div key={color.name} className="surface-panel p-4">
                <div className="mb-3 h-16 w-full" style={{ backgroundColor: color.hex }} />
                <p className="font-label text-xs uppercase tracking-label text-bmj-white">{color.name}</p>
                <p className="font-mono text-xs text-bmj-tan">{color.hex}</p>
                <p className="mt-1 text-xs text-bmj-cream/60">{color.lens}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Color Ratio */}
        <div className="mt-12 surface-panel-strong p-8">
          <h3 className="mb-4 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Recommended Color Ratio</h3>
          <div className="flex h-12 overflow-hidden">
            <div className="w-[60%] bg-bmj-black" title="60% Dark surfaces" />
            <div className="w-[30%] bg-bmj-cream" title="30% Cream/Paper" />
            <div className="w-[10%] bg-bmj-red" title="10% Red accent" />
          </div>
          <div className="mt-3 flex text-xs">
            <span className="w-[60%] text-bmj-tan">60% Dark</span>
            <span className="w-[30%] text-bmj-brown">30% Cream</span>
            <span className="w-[10%] text-bmj-red">10% Red</span>
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section id="typography-system" title="Typography System">
        {/* Font Families */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          <div className="surface-panel p-8">
            <p className="editorial-kicker mb-2">Display Font</p>
            <h3 className="mb-4 font-display text-5xl uppercase tracking-section text-bmj-white">Bebas Neue</h3>
            <p className="font-display text-2xl uppercase tracking-display text-bmj-cream/80">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p className="mt-2 font-display text-xl uppercase tracking-display text-bmj-cream/60">
              0123456789
            </p>
            <p className="mt-4 text-sm text-bmj-tan">
              Condensed sans-serif for headlines, titles, and commanding statements.
              All-caps preferred. License: SIL Open Font License.
            </p>
          </div>

          <div className="surface-panel p-8">
            <p className="editorial-kicker mb-2">Body Font</p>
            <h3 className="mb-4 font-body text-3xl text-bmj-white">Libre Baskerville</h3>
            <p className="font-body text-lg text-bmj-cream/80">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p className="mt-2 font-body text-lg italic text-bmj-cream/60">
              The quick brown fox jumps over the lazy dog.
            </p>
            <p className="mt-4 text-sm text-bmj-tan">
              Classical serif for long-form reading. Regular and bold weights with italics.
              License: SIL Open Font License.
            </p>
          </div>

          <div className="surface-panel p-8">
            <p className="editorial-kicker mb-2">Label Font</p>
            <h3 className="mb-4 font-label text-2xl uppercase tracking-label text-bmj-white">Oswald</h3>
            <p className="font-label text-base uppercase tracking-label text-bmj-cream/80">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p className="mt-2 font-label text-sm uppercase tracking-label-wide text-bmj-cream/60">
              Navigation / Buttons / Labels
            </p>
            <p className="mt-4 text-sm text-bmj-tan">
              Semi-condensed sans for UI elements, navigation, and metadata.
              Always uppercase with generous letter-spacing.
            </p>
          </div>

          <div className="surface-panel p-8">
            <p className="editorial-kicker mb-2">Monospace Font</p>
            <h3 className="mb-4 font-mono text-2xl text-bmj-white">IBM Plex Mono</h3>
            <p className="font-mono text-base text-bmj-cream/80">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p className="mt-2 font-mono text-sm text-bmj-cream/60">
              0123456789 :: -- == {"=>"} {"<-"}
            </p>
            <p className="mt-4 text-sm text-bmj-tan">
              For code blocks, timestamps, and tabular data.
              Clean technical aesthetic that complements editorial tone.
            </p>
          </div>
        </div>

        {/* Type Scale */}
        <div className="surface-panel-strong p-8">
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Type Scale</h3>
          <div className="space-y-6">
            {TYPE_SCALE.map((level) => (
              <div key={level.name} className="flex items-baseline gap-4 border-b border-bmj-tan/10 pb-4">
                <span className="w-24 shrink-0 font-mono text-xs text-bmj-tan">{level.size}</span>
                <span
                  className={`flex-1 ${
                    level.font === "Bebas Neue"
                      ? "font-display uppercase tracking-display"
                      : level.font === "Oswald"
                      ? "font-label uppercase tracking-label"
                      : level.font === "IBM Plex Mono"
                      ? "font-mono"
                      : "font-body"
                  }`}
                  style={{ fontSize: level.size, fontWeight: level.weight }}
                >
                  {level.name}
                </span>
                <span className="hidden shrink-0 text-right text-xs text-bmj-cream/50 sm:block">{level.use}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Components */}
      <Section title="Component Patterns">
        {/* Buttons */}
        <div className="mb-12">
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Action</button>
            <button className="btn-secondary">Secondary Action</button>
            <button className="btn-ghost">Ghost Button</button>
            <button className="btn-primary btn-lg">Large Primary</button>
            <button className="btn-secondary btn-sm">Small Secondary</button>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-12">
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Card Variants</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article className="card-media p-6">
              <p className="editorial-kicker mb-2">Article Card</p>
              <h4 className="mb-2 font-display text-2xl uppercase tracking-display text-bmj-white">
                Headline Goes Here
              </h4>
              <p className="text-sm text-bmj-cream/70">
                Top-heavy border style for headline content. Mimics broadsheet layout conventions.
              </p>
              <p className="meta-stamp mt-4">March 15, 2026</p>
            </article>

            <article className="card-stripe p-6">
              <p className="editorial-kicker mb-2">Briefing Card</p>
              <h4 className="mb-2 font-display text-2xl uppercase tracking-display text-bmj-white">
                Briefing Title
              </h4>
              <p className="text-sm text-bmj-cream/70">
                Left accent stripe for briefings and dispatches. Bulletin-style treatment.
              </p>
              <p className="meta-stamp mt-4">March 15, 2026</p>
            </article>

            <article className="card-feature p-6">
              <p className="editorial-kicker mb-2">Feature Card</p>
              <h4 className="mb-2 font-display text-2xl uppercase tracking-display text-bmj-white">
                Featured Content
              </h4>
              <p className="text-sm text-bmj-cream/70">
                Uniform border for featured content. Clean, standalone panel aesthetic.
              </p>
              <p className="meta-stamp mt-4">March 15, 2026</p>
            </article>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-12">
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Navigation</h3>
          <nav className="surface-panel flex items-center gap-8 p-4">
            <a href="#" className="nav-link nav-link-active">Articles</a>
            <a href="#" className="nav-link">Briefings</a>
            <a href="#" className="nav-link">Academy</a>
            <a href="#" className="nav-link">About</a>
          </nav>
        </div>

        {/* Filter Chips */}
        <div>
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Filter Chips</h3>
          <div className="flex flex-wrap gap-2">
            <button className="filter-chip filter-chip-active">All</button>
            <button className="filter-chip filter-chip-inactive">Politics</button>
            <button className="filter-chip filter-chip-inactive">Culture</button>
            <button className="filter-chip filter-chip-inactive">Health</button>
            <button className="filter-chip filter-chip-inactive">Business</button>
          </div>
        </div>
      </Section>

      {/* Texture & Treatment */}
      <Section title="Texture and Visual Treatment">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Grain Overlay */}
          <div className="surface-panel p-8">
            <h3 className="mb-4 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Grain Overlay</h3>
            <div className="relative h-40 bg-bmj-deep-black">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                  opacity: 0.12,
                }}
              />
              <div className="relative flex h-full items-center justify-center">
                <span className="font-display text-2xl uppercase tracking-section text-bmj-white">
                  Film Grain Effect
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-bmj-cream/70">
              Subtle noise overlay connects digital surfaces to print heritage. 
              Applied at 9% opacity on backgrounds only.
            </p>
          </div>

          {/* Paper Texture */}
          <div className="surface-panel p-8">
            <h3 className="mb-4 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Paper Texture</h3>
            <div className="paper-texture relative h-40 bg-bmj-paper">
              <div className="relative flex h-full items-center justify-center">
                <span className="font-display text-2xl uppercase tracking-section text-bmj-deep-black">
                  Aged Paper Ground
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-bmj-cream/70">
              Warm paper tones with subtle texture for print-like surfaces.
              Used sparingly for contrast sections.
            </p>
          </div>
        </div>

        {/* Image Treatments */}
        <div className="mt-8">
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">Image Treatment Styles</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-panel p-4 text-center">
              <div className="mb-3 h-32 bg-bmj-deep-black" />
              <span className="font-label text-xs uppercase tracking-label text-bmj-tan">High Contrast B/W</span>
            </div>
            <div className="surface-panel p-4 text-center">
              <div className="mb-3 h-32 bg-gradient-to-br from-bmj-black to-bmj-red opacity-80" />
              <span className="font-label text-xs uppercase tracking-label text-bmj-tan">Duotone (Red + Black)</span>
            </div>
            <div className="surface-panel p-4 text-center">
              <div className="halftone-dots relative mb-3 h-32 bg-bmj-cream">
                <div className="halftone-heavy absolute inset-0 bg-bmj-deep-black opacity-60" />
              </div>
              <span className="font-label text-xs uppercase tracking-label text-bmj-tan">Halftone Pattern</span>
            </div>
            <div className="surface-panel p-4 text-center">
              <div className="mb-3 h-32 bg-bmj-deep-black" style={{ 
                background: `linear-gradient(135deg, #0D0C0B 0%, #0D0C0B 33%, #3B2417 33%, #3B2417 66%, #E8DCC8 66%, #E8DCC8 100%)`
              }} />
              <span className="font-label text-xs uppercase tracking-label text-bmj-tan">Posterized (3-tone)</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Do/Don't */}
      <Section title="Guidelines">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="surface-panel p-8">
            <h3 className="mb-6 flex items-center gap-2 font-display text-2xl uppercase tracking-display text-bmj-olive">
              <span className="text-3xl">+</span> Do
            </h3>
            <ul className="space-y-3 text-sm text-bmj-cream/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-olive" />
                Use red sparingly but decisively for maximum impact
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-olive" />
                Maintain high contrast for readability and authority
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-olive" />
                Honor print heritage through texture and materiality
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-olive" />
                Keep typography commanding and hierarchical
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-olive" />
                Treat portraits as symbols of authority and conviction
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-olive" />
                Build layouts that feel archival and intentional
              </li>
            </ul>
          </div>

          <div className="surface-panel p-8">
            <h3 className="mb-6 flex items-center gap-2 font-display text-2xl uppercase tracking-display text-bmj-red">
              <span className="text-3xl">-</span> {"Don't"}
            </h3>
            <ul className="space-y-3 text-sm text-bmj-cream/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-red" />
                Soften the system into generic editorial elegance
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-red" />
                Drift into luxury branding or startup minimalism
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-red" />
                Overuse secondary colors or create rainbow effects
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-red" />
                Make the visual identity feel playful or decorative
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-red" />
                Use overly clean digital surfaces that erase print lineage
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bmj-red" />
                Compromise accessibility for aesthetic choices
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Implementation */}
      <Section id="implementation-reference" title="Implementation Reference">
        <div className="surface-panel-strong p-8">
          <h3 className="mb-6 font-label text-sm uppercase tracking-label-lg text-bmj-tan">CSS Custom Properties</h3>
          <pre className="overflow-x-auto rounded bg-bmj-black p-6 font-mono text-sm text-bmj-cream/90">
{`/* Core Colors */
--bmj-red:    #C0281F;
--bmj-black:  #0D0C0B;
--bmj-cream:  #E8DCC8;
--bmj-white:  #F2EDE4;

/* Secondary Colors */
--bmj-amber:  #C8852A;
--bmj-brown:  #3B2417;
--bmj-tan:    #B8986A;

/* Font Stack */
--font-display: 'Bebas Neue', sans-serif;
--font-body:    'Libre Baskerville', serif;
--font-label:   'Oswald', sans-serif;
--font-mono:    'IBM Plex Mono', monospace;

/* Tracking Scale */
--tracking-display:  0.04em;
--tracking-section:  0.06em;
--tracking-wordmark: 0.08em;
--tracking-label:    0.18em;`}
          </pre>
        </div>
      </Section>

      {/* Footer */}
      <footer className="mt-16 border-t border-bmj-tan/20 pt-8 text-center">
        <p className="font-label text-xs uppercase tracking-label-wide text-bmj-tan/60">
          Black Male Journal Brand Identity System
        </p>
        <p className="mt-2 font-mono text-xs text-bmj-tan/40">
          Version 2.0 — April 2026
        </p>
      </footer>
    </div>
  );
}
