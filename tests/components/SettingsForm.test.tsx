import { render, screen } from '@testing-library/react';
import { SettingsForm } from '@/app/(auth)/portal/settings/SettingsForm';

jest.mock('@/app/(auth)/actions', () => ({
  updateProfile: jest.fn(),
  updatePassword: jest.fn(),
}));

describe('SettingsForm', () => {
  it('renders display name input with default value', () => {
    render(<SettingsForm displayName="The Chairman" email="chairman@bmj.com" />);
    const input = screen.getByLabelText(/display name/i);
    expect(input).toHaveValue('The Chairman');
  });

  it('renders email as read-only text (not an input)', () => {
    render(<SettingsForm displayName="The Chairman" email="chairman@bmj.com" />);
    expect(screen.getByText('chairman@bmj.com')).toBeInTheDocument();
    // Email should not be an input
    const emailInputs = screen.queryAllByRole('textbox').filter(
      (el) => (el as HTMLInputElement).type === 'email',
    );
    expect(emailInputs).toHaveLength(0);
  });

  it('renders password input with minLength=6', () => {
    render(<SettingsForm displayName="The Chairman" email="chairman@bmj.com" />);
    const passwordInput = screen.getByLabelText(/new password/i);
    expect(passwordInput).toHaveAttribute('minLength', '6');
    expect(passwordInput).toHaveAttribute('placeholder', 'Enter a new password');
  });

  it('has "Save Changes" and "Update Password" buttons', () => {
    render(<SettingsForm displayName="The Chairman" email="chairman@bmj.com" />);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });
});
