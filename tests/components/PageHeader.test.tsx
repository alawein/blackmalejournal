import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/layout/PageHeader';

describe('PageHeader', () => {
  test('renders title as h1', () => {
    render(<PageHeader title="Articles" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Articles');
  });

  test('renders description when provided', () => {
    render(<PageHeader title="Downloads" description="Templates and toolkits." />);
    expect(screen.getByText('Templates and toolkits.')).toBeInTheDocument();
  });

  test('does not render description when omitted', () => {
    const { container } = render(<PageHeader title="Articles" />);
    const paragraphs = container.querySelectorAll('p');
    // Only paragraph should be none (no label, no description)
    expect(paragraphs).toHaveLength(0);
  });

  test('renders label when provided', () => {
    render(<PageHeader title="Our Mission" label="About" />);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  test('applies page title styling to h1 when label is present', () => {
    render(<PageHeader title="Our Mission" label="About" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('page-title');
  });

  test('uses page title styling when label is absent', () => {
    render(<PageHeader title="Articles" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('page-title');
  });

  test('renders icon when provided', () => {
    render(
      <PageHeader
        title="Weekend Briefing"
        icon={<span data-testid="test-icon">icon</span>}
      />,
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Weekend Briefing');
  });

  test('applies page title styling to h1 when both label and icon are present', () => {
    render(
      <PageHeader
        title="Weekend Briefing"
        label="Flagship"
        icon={<span data-testid="test-icon">icon</span>}
      />,
    );
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('page-title');
  });

  test('renders StarDivider', () => {
    render(<PageHeader title="Articles" />);
    expect(screen.getByRole('separator', { hidden: true })).toBeInTheDocument();
  });

  test('applies custom className to wrapper', () => {
    const { container } = render(<PageHeader title="Articles" className="mt-12" />);
    const header = container.querySelector('header');
    expect(header?.className).toContain('mt-12');
  });

  test('applies custom dividerClassName to StarDivider', () => {
    render(<PageHeader title="Articles" dividerClassName="mb-12" />);
    const divider = screen.getByRole('separator', { hidden: true });
    expect(divider.className).toContain('mb-12');
  });
});
