import { render, screen } from '@testing-library/react';
import { HeroBanner } from '@/components/home/HeroBanner';

// The global framer-motion mock from tests/setup.ts handles motion.* components
describe('HeroBanner', () => {
  it('renders main headline', () => {
    render(<HeroBanner />);
    expect(screen.getByText('THE BLACK MALE JOURNAL')).toBeInTheDocument();
  });

  it('renders CTA link to briefings', () => {
    render(<HeroBanner />);
    const link = screen.getByRole('link', { name: /read the latest briefing/i });
    expect(link).toHaveAttribute('href', '/briefings');
  });

  it('imports useReducedMotion from framer-motion', async () => {
    const fs = await import('fs');
    const source = fs.readFileSync('src/components/home/HeroBanner.tsx', 'utf-8');
    expect(source).toContain('useReducedMotion');
  });
});
