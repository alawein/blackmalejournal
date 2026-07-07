import { render, screen } from '@testing-library/react';
import { SignupForm } from '@/app/(auth)/signup/SignupForm';

jest.mock('@/app/(auth)/actions', () => ({
  signup: jest.fn(),
}));

describe('SignupForm', () => {
  it('renders name, email, password fields', () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
  });

  it('shows tier preview when preselectedTier is set and not "free"', () => {
    render(<SignupForm preselectedTier="premium" />);
    expect(screen.getByText(/selected: premium plan/i)).toBeInTheDocument();
    expect(screen.getByText(/directed to payment after signup/i)).toBeInTheDocument();
  });

  it('does NOT show tier preview when preselectedTier is "free" or undefined', () => {
    const { rerender } = render(<SignupForm />);
    expect(screen.queryByText(/selected:/i)).not.toBeInTheDocument();

    rerender(<SignupForm preselectedTier="free" />);
    expect(screen.queryByText(/selected:/i)).not.toBeInTheDocument();
  });

  it('has link to /login', () => {
    render(<SignupForm />);
    const link = screen.getByRole('link', { name: /log in/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});

describe('SignupForm with tier selector', () => {
  it('renders TierSelector above the form', () => {
    render(<SignupForm />);
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('BASIC')).toBeInTheDocument();
    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('defaults to free tier when no preselectedTier', () => {
    render(<SignupForm />);
    const freeCard = screen.getByText('FREE').closest('[data-tier]');
    expect(freeCard).toHaveAttribute('data-selected', 'true');
  });

  it('preselects the tier from props', () => {
    render(<SignupForm preselectedTier="premium" />);
    const premiumCard = screen.getByText('PREMIUM').closest('[data-tier]');
    expect(premiumCard).toHaveAttribute('data-selected', 'true');
  });

  it('shows payment redirect notice for paid tiers', () => {
    render(<SignupForm preselectedTier="basic" />);
    expect(screen.getByText(/directed to payment/i)).toBeInTheDocument();
  });

  it('does not show payment notice for free tier', () => {
    render(<SignupForm preselectedTier="free" />);
    expect(screen.queryByText(/directed to payment/i)).not.toBeInTheDocument();
  });
});
