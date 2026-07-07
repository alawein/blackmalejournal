import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteButton } from '@/components/admin/DeleteButton';

describe('DeleteButton', () => {
  it('renders delete button', () => {
    render(<DeleteButton action={async () => {}} itemName="article" />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('shows confirmation dialog on click', () => {
    render(<DeleteButton action={async () => {}} itemName="article" />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('has cancel button in confirmation state', () => {
    render(<DeleteButton action={async () => {}} itemName="article" />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
