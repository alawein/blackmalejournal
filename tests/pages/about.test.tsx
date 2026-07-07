import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/(public)/about/page';

jest.mock('@/components/ui/StarDivider', () => ({
  StarDivider: ({ className }: { className?: string }) => (
    <hr data-testid="star-divider" className={className} />
  ),
}));

jest.mock('@/components/content/TributeCard', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div data-testid="tribute-card">{name}</div>,
}));

describe('AboutPage', () => {
  it('renders "Intellectual Lineage & Architects" section heading', () => {
    render(<AboutPage />);
    expect(screen.getByText(/Intellectual Lineage & Architects/i)).toBeInTheDocument();
  });

  it('renders subheading about honoring intellectual lineage', () => {
    render(<AboutPage />);
    expect(
      screen.getByRole('heading', { name: /We Honor Those Who Built the Road/i })
    ).toBeInTheDocument();
  });

  it('does NOT render old "Ancestors & Architects" text', () => {
    render(<AboutPage />);
    expect(screen.queryByText(/Ancestors & Architects/)).not.toBeInTheDocument();
  });
});
