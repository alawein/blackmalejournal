import { render, screen, fireEvent } from '@testing-library/react';
import { TierSelector } from '@/app/(auth)/signup/TierSelector';

describe('TierSelector', () => {
  it('renders three tier cards: Free, Basic, Premium', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('BASIC')).toBeInTheDocument();
    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('shows $0/month for free tier', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('shows $9/month for basic tier', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);
    expect(screen.getByText('$9')).toBeInTheDocument();
  });

  it('shows $19/month for premium tier', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);
    expect(screen.getByText('$19')).toBeInTheDocument();
  });

  it('highlights the selected tier', () => {
    render(<TierSelector selectedTier="basic" onSelect={jest.fn()} />);
    const basicCard = screen.getByText('BASIC').closest('[data-tier]');
    expect(basicCard).toHaveAttribute('data-selected', 'true');
  });

  it('calls onSelect when a tier card is clicked', () => {
    const onSelect = jest.fn();
    render(<TierSelector selectedTier="free" onSelect={onSelect} />);
    fireEvent.click(screen.getByText('PREMIUM'));
    expect(onSelect).toHaveBeenCalledWith('premium');
  });

  it('renders feature lists for each tier', () => {
    render(<TierSelector selectedTier="free" onSelect={jest.fn()} />);
    expect(screen.getByText('Public articles')).toBeInTheDocument();
    expect(screen.getByText('Full Weekend Briefing archive')).toBeInTheDocument();
    expect(screen.getByText('Priority access to new releases')).toBeInTheDocument();
  });
});
