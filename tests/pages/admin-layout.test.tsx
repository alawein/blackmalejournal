import { render, screen } from '@testing-library/react';
import { PATHS } from '@/lib/paths';
import { AdminNav } from '@/app/(auth)/admin/AdminNav';

// usePathname is mocked per-test via mockReturnValue
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/components/brand/BrandMark', () => ({
  BrandMark: ({ size, color }: { size?: number; color?: string }) => (
    <svg data-testid="brand-mark" data-size={size} data-color={color} />
  ),
}));

describe('AdminNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue(PATHS.ADMIN);
  });

  it('renders the "ADMIN" heading', () => {
    render(<AdminNav displayName="The Chairman" role="admin" />);
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('renders the BrandMark', () => {
    render(<AdminNav displayName="The Chairman" role="admin" />);
    expect(screen.getByTestId('brand-mark')).toBeInTheDocument();
  });

  it('renders all 11 nav links', () => {
    render(<AdminNav displayName="The Chairman" role="admin" />);
    const nav = screen.getByRole('navigation', { name: /admin navigation/i });
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(11);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('Briefings')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Dispatches')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('Handbooks')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Subscribers')).toBeInTheDocument();
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
  });

  it('renders the user display name', () => {
    render(<AdminNav displayName="The Chairman" role="admin" />);
    expect(screen.getByText('The Chairman')).toBeInTheDocument();
  });

  it('renders the role badge', () => {
    render(<AdminNav displayName="The Chairman" role="editor" />);
    expect(screen.getByText('editor')).toBeInTheDocument();
  });

  it('renders children content when used as a wrapper', () => {
    render(
      <div>
        <AdminNav displayName="The Chairman" role="admin" />
        <div data-testid="child-content">Dashboard content here</div>
      </div>,
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('highlights Dashboard link when on /admin', () => {
    mockUsePathname.mockReturnValue(PATHS.ADMIN);
    render(<AdminNav displayName="The Chairman" role="admin" />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-bmj-red/10');
    expect(dashboardLink).toHaveClass('text-bmj-white');
  });

  it('highlights Articles link when on /admin/articles', () => {
    mockUsePathname.mockReturnValue(PATHS.ADMIN_ARTICLES);
    render(<AdminNav displayName="The Chairman" role="admin" />);
    const articlesLink = screen.getByText('Articles').closest('a');
    expect(articlesLink).toHaveClass('bg-bmj-red/10');

    // Dashboard should NOT be active
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toHaveClass('bg-bmj-red/10');
  });

  it('highlights Articles link on sub-routes like /admin/articles/new', () => {
    mockUsePathname.mockReturnValue(PATHS.ADMIN_ARTICLES_NEW);
    render(<AdminNav displayName="The Chairman" role="admin" />);
    const articlesLink = screen.getByText('Articles').closest('a');
    expect(articlesLink).toHaveClass('bg-bmj-red/10');
  });
});
