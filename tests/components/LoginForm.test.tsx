import { render, screen, fireEvent, within } from '@testing-library/react';
import { LoginForm } from '@/app/(auth)/login/LoginForm';

jest.mock('@/app/(auth)/actions', () => ({
  login: jest.fn(),
  signInWithMagicLink: jest.fn(),
}));

describe('LoginForm', () => {
  it('renders password form by default', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders email and password fields in password mode', () => {
    render(<LoginForm />);
    const passwordPanel = screen.getByRole('tabpanel', { name: /^password$/i });
    expect(within(passwordPanel).getByLabelText('Email')).toBeInTheDocument();
    expect(within(passwordPanel).getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('switches to magic link mode on toggle', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('tab', { name: /magic link/i }));
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });

  it('magic link mode shows only email field', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('tab', { name: /magic link/i }));
    const magicPanel = screen.getByRole('tabpanel', { name: /magic link/i });
    expect(within(magicPanel).getByLabelText('Email')).toBeInTheDocument();
    expect(within(magicPanel).queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('shows "Log In" and "Send Magic Link" buttons respectively', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /send magic link/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /magic link/i }));
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });
});
