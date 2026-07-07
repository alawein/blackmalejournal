import { render, screen } from '@testing-library/react';
import TributeCard from '@/components/content/TributeCard';

const defaultProps = {
  name: 'Malcolm X',
  dates: '1925 - 1965',
};

describe('TributeCard', () => {
  it('renders name, dates, and "In Memoriam" label', () => {
    render(<TributeCard {...defaultProps} />);
    expect(screen.getByText('Malcolm X')).toBeInTheDocument();
    expect(screen.getByText('1925 - 1965')).toBeInTheDocument();
    expect(screen.getByText('In Memoriam')).toBeInTheDocument();
  });

  it('renders honorific when provided', () => {
    render(<TributeCard {...defaultProps} honorific="El-Hajj Malik El-Shabazz" />);
    expect(screen.getByText('El-Hajj Malik El-Shabazz')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<TributeCard {...defaultProps} description="A revolutionary leader." />);
    expect(screen.getByText('A revolutionary leader.')).toBeInTheDocument();
  });

  it('renders image when imageUrl provided', () => {
    render(<TributeCard {...defaultProps} imageUrl="/img/malcolm.jpg" />);
    const img = screen.getByRole('img', { name: 'Malcolm X' });
    expect(img).toBeInTheDocument();
  });
});
