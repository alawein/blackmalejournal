import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutButton } from '@/components/portal/CheckoutButton';

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('CheckoutButton', () => {
  it('renders children', () => {
    render(<CheckoutButton tier="premium">Get Premium</CheckoutButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Get Premium');
  });

  it('shows "Redirecting..." during loading', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<CheckoutButton tier="basic">Upgrade</CheckoutButton>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Redirecting...');
    });
  });

  it('calls /api/stripe/checkout with correct tier', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://example.com/mock-checkout' }),
    });
    render(<CheckoutButton tier="premium">Go</CheckoutButton>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/checkout', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ tier: 'premium' }),
      }));
    });
  });

  it('calls checkout API and receives redirect URL on success', async () => {
    const MOCK_URL = 'https://example.com/mock-session';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: MOCK_URL }),
    });
    render(<CheckoutButton tier="basic">Go</CheckoutButton>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/checkout', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ tier: 'basic' }),
      }));
    });
  });

  it('handles error when no URL returned', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    render(<CheckoutButton tier="basic">Go</CheckoutButton>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Could not start checkout. Please try again.',
      );
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('has role="status" on loading text for screen readers', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<CheckoutButton tier="basic">Upgrade</CheckoutButton>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveTextContent('Redirecting...');
    });
  });
});
