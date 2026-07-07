'use client';

export type TierId = 'free' | 'basic' | 'premium';

interface TierSelectorProps {
  selectedTier: TierId;
  onSelect: (tier: TierId) => void;
}

const TIERS = [
  {
    id: 'free',
    name: 'FREE',
    price: '$0',
    interval: '/month',
    description: 'Start here. Access the archive.',
    features: [
      'Public articles',
      'Briefing previews',
      'Video gallery',
      'Academy access',
    ],
    border: 'border-bmj-tan/40',
    accent: 'text-bmj-cream',
    selectedBorder: 'border-bmj-cream',
  },
  {
    id: 'basic',
    name: 'BASIC',
    price: '$9',
    interval: '/month',
    description: 'Full access to the archive and member resources.',
    features: [
      'Everything in Free',
      'Full Weekend Briefing archive',
      'Select handbooks',
      'Member-only resource access',
    ],
    border: 'border-bmj-amber/40',
    accent: 'text-bmj-amber',
    selectedBorder: 'border-bmj-amber',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '$19',
    interval: '/month',
    description: 'Complete access. Everything we build, you get.',
    features: [
      'Everything in Basic',
      'All handbooks and downloads',
      'Private content',
      'Early access to new features',
      'Priority access to new releases',
    ],
    border: 'border-bmj-red/40',
    accent: 'text-bmj-red',
    selectedBorder: 'border-bmj-red',
  },
] as const;

export function TierSelector({ selectedTier, onSelect }: TierSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {TIERS.map((t) => {
        const isSelected = selectedTier === t.id;
        return (
          <button
            key={t.id}
            type="button"
            data-tier={t.id}
            data-selected={isSelected}
            onClick={() => onSelect(t.id)}
            className={`border ${
              isSelected ? `${t.selectedBorder} ring-1 ring-current` : t.border
            } bg-bmj-brown p-6 text-left transition-all hover:border-opacity-80`}
          >
            <h3 className={`mb-1 font-display text-2xl ${t.accent}`}>
              {t.name}
            </h3>
            <div className="mb-3 flex items-baseline gap-1">
              <span className="font-display text-3xl text-bmj-white">
                {t.price}
              </span>
              <span className="font-mono text-xs text-bmj-tan">
                {t.interval}
              </span>
            </div>
            <p className="mb-4 font-body text-xs text-bmj-cream/60">
              {t.description}
            </p>
            <ul className="space-y-1.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-xs text-bmj-red" aria-hidden="true">
                    ★
                  </span>
                  <span className="font-body text-xs text-bmj-cream/80">{f}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
