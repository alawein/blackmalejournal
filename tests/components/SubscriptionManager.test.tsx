import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubscriptionManager } from '@/components/portal/SubscriptionManager';

jest.mock('@/components/portal/TierBadge', () => ({
  TierBadge: ({ tier }: { tier: string }) => <span data-testid="tier-badge">{tier.toUpperCase()}</span>,
}));

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('SubscriptionManager', () => {
  it('renders current tier badge', () => {
    render(<SubscriptionManager tier="basic" hasSubscription={false} />);
    expect(screen.getByTestId('tier-badge')).toHaveTextContent('BASIC');
  });

  it('shows "Upgrade to Premium" for basic tier', () => {
    render(<SubscriptionManager tier="basic" hasSubscription={true} />);
    expect(screen.getByRole('button', { name: /upgrade to premium/i })).toBeInTheDocument();
  });

  it('shows an immediate upgrade action for free tier', () => {
    render(<SubscriptionManager tier="free" hasSubscription={false} />);
    expect(
      screen.getByRole('button', { name: /start basic membership/i }),
    ).toBeInTheDocument();
  });

  it('shows "Manage Billing" when hasSubscription is true', () => {
    render(<SubscriptionManager tier="basic" hasSubscription={true} />);
    expect(screen.getByRole('button', { name: /manage billing/i })).toBeInTheDocument();
  });

  it('hides "Manage Billing" when hasSubscription is false', () => {
    render(<SubscriptionManager tier="basic" hasSubscription={false} />);
    expect(screen.queryByRole('button', { name: /manage billing/i })).not.toBeInTheDocument();
  });

  it('upgrade button calls /api/stripe/checkout with premium tier', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://example.com/mock-upgrade' }),
    });
    render(<SubscriptionManager tier="basic" hasSubscription={true} />);
    fireEvent.click(screen.getByRole('button', { name: /upgrade to premium/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/checkout', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ tier: 'premium' }),
      }));
    });
  });

  it('manage billing button calls /api/stripe/manage-billing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://example.com/mock-portal' }),
    });
    render(<SubscriptionManager tier="premium" hasSubscription={true} />);
    fireEvent.click(screen.getByRole('button', { name: /manage billing/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/manage-billing', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  it('ignores lower-tier requested states for premium members', () => {
    render(
      <SubscriptionManager
        tier="premium"
        hasSubscription={true}
        requestedTier="basic"
      />,
    );

    expect(screen.queryByRole('button', { name: /upgrade/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage billing/i })).toBeInTheDocument();
  });
});
