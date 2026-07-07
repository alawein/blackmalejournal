import { render, screen } from '@testing-library/react';
import { ThreeLenses } from '@/components/home/ThreeLenses';

describe('ThreeLenses', () => {
  it('renders all five lens cards', () => {
    render(<ThreeLenses />);
    expect(screen.getByText('Health/Wellness')).toBeInTheDocument();
    expect(screen.getByText('Politics/Law')).toBeInTheDocument();
    expect(screen.getByText('Culture/Ideology')).toBeInTheDocument();
    expect(screen.getByText('Entertainment/Technology')).toBeInTheDocument();
    expect(screen.getByText('Business/Finance')).toBeInTheDocument();
  });

  it('links each lens to the correct articles filter', () => {
    render(<ThreeLenses />);
    const healthLink = screen.getByRole('link', { name: /health/i });
    expect(healthLink).toHaveAttribute('href', '/articles?lens=health');
  });

  it('does not use shadow effects on lens cards (brand compliance)', () => {
    const { container } = render(<ThreeLenses />);
    const links = container.querySelectorAll('a');
    links.forEach((link) => {
      expect(link.className).not.toMatch(/shadow-\[/);
    });
  });
});
