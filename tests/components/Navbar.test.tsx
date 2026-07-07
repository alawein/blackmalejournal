import { render, screen, within } from '@testing-library/react';
import { Navbar } from '@/components/layout/Navbar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(),
}));

describe('Navbar', () => {
  it('renders logo and nav links', () => {
    render(<Navbar />);
    expect(screen.getByText('The Black Male Journal')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
  });

  it('shows Login/Join buttons when no user', () => {
    render(<Navbar />);
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
  });

  it('shows user dropdown when user provided', () => {
    render(<Navbar user={{ email: 'test@example.com', displayName: 'Tester' }} />);
    // User dropdown renders the initial letter
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('has aria labels for accessibility', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('The Black Male Journal — Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
  });

  it('sets aria-current="page" on active Home link', () => {
    render(<Navbar />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive links', () => {
    render(<Navbar />);
    const aboutLink = screen.getByRole('link', { name: 'About' });
    expect(aboutLink).not.toHaveAttribute('aria-current');
  });
});

describe('Navbar simplified navigation', () => {
  it('renders exactly 5 nav links', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation', { name: /main/i });
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(5);
  });

  it('renders Home, About, Academy, Downloads, Records', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Academy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Downloads' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Records' })).toBeInTheDocument();
  });

  it('displays the brand tagline', () => {
    render(<Navbar />);
    expect(screen.getByText(/Speak the Truth/i)).toBeInTheDocument();
  });

  it('does NOT render Handbooks, Video, Blog, Pricing, or Contact in nav', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation', { name: /main/i });
    expect(within(nav).queryByRole('link', { name: 'Handbooks' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Video' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  });
});
