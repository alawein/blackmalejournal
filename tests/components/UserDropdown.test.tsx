import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserDropdown } from '@/components/layout/UserDropdown';

jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(),
}));

const defaultProps = {
  email: 'test@example.com',
};

describe('UserDropdown', () => {
  it('renders user initial', () => {
    render(<UserDropdown {...defaultProps} />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<UserDropdown {...defaultProps} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Portal')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('shows Portal, Settings, and Log Out links', async () => {
    const user = userEvent.setup();
    render(<UserDropdown {...defaultProps} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('link', { name: 'Portal' })).toHaveAttribute('href', '/portal');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/portal/settings');
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('uses displayName initial when provided, falls back to email', () => {
    const { rerender } = render(<UserDropdown email="test@example.com" displayName="Malcolm" />);
    expect(screen.getByText('M')).toBeInTheDocument();

    rerender(<UserDropdown email="test@example.com" />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('does not use drop shadows on dropdown menu (brand compliance)', async () => {
    const user = userEvent.setup();
    const { container } = render(<UserDropdown {...defaultProps} />);
    await user.click(screen.getByRole('button'));
    const allClassNames = Array.from(container.querySelectorAll('*'))
      .map((el) => el.className)
      .filter((cn) => typeof cn === 'string')
      .join(' ');
    expect(allClassNames).not.toMatch(/shadow/);
  });
});
