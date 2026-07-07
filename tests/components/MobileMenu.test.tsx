import { render, screen, fireEvent } from '@testing-library/react';
import { MobileMenu } from '@/components/layout/MobileMenu';

jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(),
}));

describe('MobileMenu', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<MobileMenu isOpen={false} onClose={jest.fn()} />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders nav links when open', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('Records')).toBeInTheDocument();
  });

  it('shows Portal link and Log Out button when user is provided', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={jest.fn()}
        user={{ email: 'test@example.com', displayName: 'Test' }}
      />,
    );
    expect(screen.getByText('Portal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('shows Join and Log In links when no user', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Join')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.queryByText('Portal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(<MobileMenu isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close navigation menu'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('MobileMenu simplified navigation', () => {
  it('renders exactly 5 nav links when open', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    const navLabels = ['Home', 'About', 'Academy', 'Downloads', 'Records'];
    navLabels.forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('does NOT render removed nav items', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />);
    expect(screen.queryByRole('link', { name: 'Handbooks' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Video' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  });
});
