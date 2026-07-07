import { render, screen } from '@testing-library/react';
import { VideoCard } from '@/components/content/VideoCard';

const defaultProps = {
  title: 'Test Video Title',
  youtubeId: 'abc123xyz',
  publishedAt: '2026-03-15T12:00:00Z',
};

describe('VideoCard', () => {
  it('renders title', () => {
    render(<VideoCard {...defaultProps} />);
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  it('shows YouTube thumbnail URL with youtubeId', () => {
    render(<VideoCard {...defaultProps} />);
    const img = screen.getByRole('img', { name: 'Test Video Title' });
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('abc123xyz'),
    );
  });

  it('shows formatted date', () => {
    render(<VideoCard {...defaultProps} />);
    expect(screen.getByText('MARCH 15, 2026')).toBeInTheDocument();
  });
});
