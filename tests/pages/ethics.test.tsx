import { render, screen } from '@testing-library/react';
import EthicsPage from '@/app/(public)/about/ethics/page';

jest.mock('@/components/ui/StarDivider', () => ({
  StarDivider: ({ className }: { className?: string }) => (
    <hr data-testid="star-divider" className={className} />
  ),
}));

jest.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({
    label,
    title,
    description,
  }: {
    label?: string;
    title: string;
    description?: string;
  }) => (
    <header data-testid="page-header">
      {label && <p>{label}</p>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  ),
}));

describe('EthicsPage', () => {
  it('renders the page title "Editorial Ethics"', () => {
    render(<EthicsPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Editorial Ethics/i })
    ).toBeInTheDocument();
  });

  it('renders the PageHeader with label "Standards"', () => {
    render(<EthicsPage />);
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Standards')).toBeInTheDocument();
  });

  it('renders the Independence section heading', () => {
    render(<EthicsPage />);
    expect(
      screen.getByRole('heading', { name: /Independence/i })
    ).toBeInTheDocument();
  });

  it('renders the Accuracy & Rigor section heading', () => {
    render(<EthicsPage />);
    expect(
      screen.getByRole('heading', { name: /Accuracy & Rigor/i })
    ).toBeInTheDocument();
  });

  it('renders the Corrections Policy section heading', () => {
    render(<EthicsPage />);
    expect(
      screen.getByRole('heading', { name: /Corrections Policy/i })
    ).toBeInTheDocument();
  });

  it('renders the Conflicts of Interest section heading', () => {
    render(<EthicsPage />);
    expect(
      screen.getByRole('heading', { name: /Conflicts of Interest/i })
    ).toBeInTheDocument();
  });

  it('renders the Attribution & Sources section heading', () => {
    render(<EthicsPage />);
    expect(
      screen.getByRole('heading', { name: /Attribution & Sources/i })
    ).toBeInTheDocument();
  });

  it('renders the "Hold Us Accountable" heading', () => {
    render(<EthicsPage />);
    expect(
      screen.getByRole('heading', { name: /Hold Us Accountable/i })
    ).toBeInTheDocument();
  });

  it('renders the Contact Us link pointing to /contact', () => {
    render(<EthicsPage />);
    const link = screen.getByRole('link', { name: /Contact Us/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/contact');
  });
});
