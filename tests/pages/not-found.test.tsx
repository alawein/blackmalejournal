import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

jest.mock('@/components/brand/BrandMark', () => ({
  BrandMark: ({ size }: { size: number }) => (
    <div data-testid="brand-mark" data-size={size} />
  ),
}));

describe('404 Page', () => {
  it('renders the 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
  });

  it('renders an editorial message', () => {
    render(<NotFound />);
    expect(screen.getByText(/page you seek/i)).toBeInTheDocument();
  });

  it('renders a link back to home', () => {
    render(<NotFound />);
    const link = screen.getByRole('link', { name: /return to the front page/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders the BrandMark', () => {
    render(<NotFound />);
    expect(screen.getByTestId('brand-mark')).toBeInTheDocument();
  });

  it('renders a link to the records', () => {
    render(<NotFound />);
    const link = screen.getByRole('link', { name: /browse the records/i });
    expect(link).toHaveAttribute('href', '/records');
  });
});
