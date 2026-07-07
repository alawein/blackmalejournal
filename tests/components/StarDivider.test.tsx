import { render, screen } from '@testing-library/react';
import { StarDivider } from '@/components/ui/StarDivider';

describe('StarDivider', () => {
  it('renders with separator role (aria-hidden)', () => {
    render(<StarDivider />);
    // StarDivider uses aria-hidden="true", so we need { hidden: true }
    expect(screen.getByRole('separator', { hidden: true })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<StarDivider className="my-8" />);
    const el = screen.getByRole('separator', { hidden: true });
    expect(el.className).toContain('my-8');
  });

  it('contains an SVG star icon', () => {
    const { container } = render(<StarDivider />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
