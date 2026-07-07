import { render, screen } from '@testing-library/react';
import { DownloadCard } from '@/components/content/DownloadCard';

const defaultProps = {
  title: 'Morning Routine Template',
  slug: 'morning-routine-template',
  description: 'A structured daily routine template.',
  category: 'template',
  fileType: 'pdf',
  fileSize: 245760,
  accessTier: 'premium' as const,
  hasAccess: false,
  fileUrl: 'https://example.com/file.pdf',
};

describe('DownloadCard', () => {
  it('renders title and description', () => {
    render(<DownloadCard {...defaultProps} />);
    expect(screen.getByText('Morning Routine Template')).toBeInTheDocument();
    expect(screen.getByText('A structured daily routine template.')).toBeInTheDocument();
  });

  it('shows file type and size', () => {
    render(<DownloadCard {...defaultProps} />);
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('240 KB')).toBeInTheDocument();
  });

  it('shows lock icon when user has no access', () => {
    const { container } = render(<DownloadCard {...defaultProps} />);
    expect(container.querySelector('[data-testid="icon-Lock"]')).toBeInTheDocument();
  });

  it('shows download link when user has access', () => {
    render(<DownloadCard {...defaultProps} hasAccess />);
    const link = screen.getByRole('link', { name: /Download/i });
    expect(link).toHaveAttribute('href', '/api/downloads/morning-routine-template');
  });

  it('shows upgrade link when user has no access', () => {
    render(<DownloadCard {...defaultProps} />);
    const link = screen.getByRole('link', { name: /Upgrade/i });
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('renders category label', () => {
    render(<DownloadCard {...defaultProps} />);
    expect(screen.getByText('Template')).toBeInTheDocument();
  });
});
