import { render, screen, fireEvent } from '@testing-library/react';
import { SearchDialog } from '@/components/ui/SearchDialog';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('SearchDialog', () => {
  test('renders nothing when closed', () => {
    render(<SearchDialog isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders search input when open', () => {
    render(<SearchDialog isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  test('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    render(<SearchDialog isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<SearchDialog isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('search-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });
});
