import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LOGOS, SOCIAL, TEXTURES } from '@/lib/images';
import { PLACEHOLDERS } from '@/lib/placeholders';

export const metadata: Metadata = {
  title: 'Image Assets',
  description: 'Complete inventory of BMJ image assets including logos, placeholders, and textures.',
  robots: { index: false, follow: false },
};

function AssetCard({ 
  src, 
  label, 
  description, 
  dimensions,
  darkBg = true,
}: { 
  src: string; 
  label: string; 
  description?: string;
  dimensions?: string;
  darkBg?: boolean;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded border border-bmj-tan/20 bg-bmj-black/50">
      <div 
        className={`relative flex aspect-video items-center justify-center overflow-hidden p-6 ${
          darkBg ? 'bg-bmj-black' : 'bg-bmj-cream'
        }`}
      >
        <Image
          src={src}
          alt={label}
          width={200}
          height={100}
          className="max-h-full max-w-full object-contain"
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col border-t border-bmj-tan/20 p-4">
        <code className="mb-1 font-mono text-xs text-bmj-amber">{src}</code>
        <h3 className="font-label text-sm uppercase tracking-label text-bmj-white">{label}</h3>
        {description && (
          <p className="mt-1 text-xs text-bmj-cream/60">{description}</p>
        )}
        {dimensions && (
          <span className="mt-2 inline-block self-start rounded bg-bmj-tan/10 px-2 py-0.5 font-mono text-xs text-bmj-tan">
            {dimensions}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-6 flex items-baseline gap-3 border-b border-bmj-red pb-3">
      <h2 className="font-display text-2xl uppercase tracking-display text-bmj-white">{title}</h2>
      <span className="font-mono text-sm text-bmj-cream/60">{count} assets</span>
    </div>
  );
}

export default function ImageAssetsPage() {
  const logoAssets = [
    { src: LOGOS.primary.svg, label: 'Primary Logo (SVG)', description: 'Full logo with icon, main brand identifier', dimensions: '280×80' },
    { src: LOGOS.primary.png, label: 'Primary Logo (PNG)', description: 'Raster fallback for JSON-LD and email', dimensions: '280×80' },
    { src: LOGOS.primary.light, label: 'Primary Light (PNG)', description: 'For dark backgrounds, Apple touch icon', dimensions: '280×80' },
    { src: LOGOS.submark.svg, label: 'Submark', description: 'Compact horizontal mark', dimensions: '120×48' },
    { src: LOGOS.monogram.svg, label: 'Monogram', description: 'BMJ letters, social avatars', dimensions: '64×64' },
    { src: LOGOS.bMark.svg, label: 'B Mark', description: 'Single letter, smallest applications', dimensions: '40×40' },
    { src: LOGOS.wordmark.light, label: 'Wordmark Light', description: 'Text logo for dark backgrounds', dimensions: '200×32', darkBg: true },
    { src: LOGOS.wordmark.dark, label: 'Wordmark Dark', description: 'Text logo for light backgrounds', dimensions: '200×32', darkBg: false },
    { src: LOGOS.favicon.default, label: 'Favicon', description: 'Browser tab icon', dimensions: '32×32' },
    { src: LOGOS.favicon.red, label: 'Favicon Red', description: 'Alternative red variant', dimensions: '32×32' },
  ];

  const placeholderAssets = Object.entries(PLACEHOLDERS).map(([key, src]) => ({
    src,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    description: `Fallback image for ${key} content type`,
    dimensions: '16:9 aspect',
  }));

  const socialAssets = [
    { src: SOCIAL.ogImage, label: 'OpenGraph Image', description: 'Default social sharing image', dimensions: '1200×630' },
  ];

  const textureAssets = [
    { src: TEXTURES.grain, label: 'Grain Texture', description: 'Film grain overlay for brand consistency', dimensions: 'Tile pattern' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <Link 
          href="/brand" 
          className="mb-6 inline-flex items-center gap-2 font-label text-sm uppercase tracking-label text-bmj-cream/60 transition-colors hover:text-bmj-amber"
        >
          <ArrowLeft size={16} />
          Back to Brand Guide
        </Link>
        <h1 className="font-display text-4xl uppercase tracking-display text-bmj-white sm:text-5xl">
          Image Assets
        </h1>
        <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-bmj-cream/80">
          Complete inventory of all image assets used in the Black Male Journal. 
          All assets follow consistent naming conventions and are optimized for web performance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded border border-bmj-tan/20 bg-bmj-black/30 p-4 text-center">
          <div className="font-display text-3xl text-bmj-red">{logoAssets.length}</div>
          <div className="font-label text-xs uppercase tracking-label text-bmj-cream/60">Logo Assets</div>
        </div>
        <div className="rounded border border-bmj-tan/20 bg-bmj-black/30 p-4 text-center">
          <div className="font-display text-3xl text-bmj-amber">{placeholderAssets.length}</div>
          <div className="font-label text-xs uppercase tracking-label text-bmj-cream/60">Placeholders</div>
        </div>
        <div className="rounded border border-bmj-tan/20 bg-bmj-black/30 p-4 text-center">
          <div className="font-display text-3xl text-bmj-tan">{socialAssets.length}</div>
          <div className="font-label text-xs uppercase tracking-label text-bmj-cream/60">Social/SEO</div>
        </div>
        <div className="rounded border border-bmj-tan/20 bg-bmj-black/30 p-4 text-center">
          <div className="font-display text-3xl text-bmj-olive">{textureAssets.length}</div>
          <div className="font-label text-xs uppercase tracking-label text-bmj-cream/60">Textures</div>
        </div>
      </div>

      {/* Logo Assets */}
      <section className="mb-16">
        <SectionHeader title="Logo Assets" count={logoAssets.length} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {logoAssets.map((asset) => (
            <AssetCard 
              key={asset.src} 
              {...asset} 
              darkBg={asset.darkBg !== false}
            />
          ))}
        </div>
      </section>

      {/* Placeholder Assets */}
      <section className="mb-16">
        <SectionHeader title="Content Placeholders" count={placeholderAssets.length} />
        <p className="mb-6 font-body text-sm text-bmj-cream/60">
          Fallback images for content without cover images. Import via{' '}
          <code className="rounded bg-bmj-black px-1.5 py-0.5 font-mono text-xs text-bmj-amber">
            {"import { PLACEHOLDERS } from '@/lib/placeholders'"}
          </code>
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {placeholderAssets.map((asset) => (
            <AssetCard key={asset.src} {...asset} />
          ))}
        </div>
      </section>

      {/* Social/SEO Assets */}
      <section className="mb-16">
        <SectionHeader title="Social &amp; SEO" count={socialAssets.length} />
        <div className="grid gap-6 sm:grid-cols-2">
          {socialAssets.map((asset) => (
            <AssetCard key={asset.src} {...asset} />
          ))}
        </div>
      </section>

      {/* Texture Assets */}
      <section className="mb-16">
        <SectionHeader title="Textures" count={textureAssets.length} />
        <div className="grid gap-6 sm:grid-cols-2">
          {textureAssets.map((asset) => (
            <AssetCard key={asset.src} {...asset} />
          ))}
        </div>
      </section>

      {/* Implementation Guide */}
      <section className="rounded border border-bmj-tan/20 bg-bmj-black/30 p-6 lg:p-8">
        <h2 className="mb-4 font-display text-xl uppercase tracking-display text-bmj-white">
          Implementation Reference
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-label text-sm uppercase tracking-label text-bmj-amber">
              Using Logo Assets
            </h3>
            <pre className="overflow-x-auto rounded bg-bmj-black p-4 font-mono text-xs text-bmj-cream">
{`import { LOGOS } from '@/lib/images';
import Image from 'next/image';

<Image 
  src={LOGOS.primary.svg} 
  alt="The Black Male Journal" 
  width={280} 
  height={80} 
  priority 
/>`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-label text-sm uppercase tracking-label text-bmj-amber">
              Using Placeholders
            </h3>
            <pre className="overflow-x-auto rounded bg-bmj-black p-4 font-mono text-xs text-bmj-cream">
{`import { PLACEHOLDERS } from '@/lib/placeholders';
import Image from 'next/image';

<Image 
  src={coverImage || PLACEHOLDERS.article}
  alt={title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 33vw"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-label text-sm uppercase tracking-label text-bmj-amber">
              Responsive Image Sizes
            </h3>
            <pre className="overflow-x-auto rounded bg-bmj-black p-4 font-mono text-xs text-bmj-cream">
{`import { IMAGE_SIZES } from '@/lib/images';

// Use presets for consistent sizing
<Image src={src} sizes={IMAGE_SIZES.card} />     // 3-col grid
<Image src={src} sizes={IMAGE_SIZES.hero} />     // Full width
<Image src={src} sizes={IMAGE_SIZES.sidebar} />  // Narrow column`}
            </pre>
          </div>
        </div>

        <div className="mt-6 border-t border-bmj-tan/20 pt-6">
          <p className="font-body text-sm text-bmj-cream/60">
            For complete documentation, see{' '}
            <code className="rounded bg-bmj-black px-1.5 py-0.5 font-mono text-xs text-bmj-amber">
              docs/brand/IMAGE-ASSET-ORGANIZATION.md
            </code>
          </p>
        </div>
      </section>
    </div>
  );
}
