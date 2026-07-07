import { render, screen } from '@testing-library/react';
import MagazineCoverHero from '@/components/content/MagazineCoverHero';

const defaultProps = {
  title: 'Weekend Briefing Title',
  date: 'March 15, 2026',
  issueNumber: 7,
  coverImageUrl: '/img/cover.jpg',
};

describe('MagazineCoverHero', () => {
  it('renders "Weekend Briefing" heading', () => {
    render(<MagazineCoverHero {...defaultProps} />);
    expect(screen.getByText('Weekend Briefing')).toBeInTheDocument();
  });

  it('renders formatted issue number padded to 3 digits', () => {
    render(<MagazineCoverHero {...defaultProps} />);
    expect(screen.getByText(/Issue No\. 007/)).toBeInTheDocument();
  });

  it('renders date and cover image', () => {
    render(<MagazineCoverHero {...defaultProps} />);
    expect(screen.getByText(/March 15, 2026/)).toBeInTheDocument();
    const img = screen.getByRole('img', { name: 'Weekend Briefing Title' });
    expect(img).toBeInTheDocument();
  });
});
