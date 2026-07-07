import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from '@/app/(public)/contact/ContactForm';

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('ContactForm', () => {
  it('renders form fields (name, email, subject, message)', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('shows "Sending..." during loading', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }));
    await waitFor(() => {
      expect(screen.getByText(/Sending[\u2026.]/)).toBeInTheDocument();
    });
  });

  it('shows success message after successful submit', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText('Message Sent')).toBeInTheDocument();
  });

  it('shows error message on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid email' }),
    });
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText('Invalid email')).toBeInTheDocument();
  });

  it('"Send Another Message" button resets to idle', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }));
    await screen.findByText('Message Sent');
    fireEvent.click(screen.getByText('Send Another Message'));
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('submit button disabled during loading', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<ContactForm />);
    const btn = screen.getByRole('button', { name: /send message/i });
    fireEvent.submit(btn);
    await waitFor(() => {
      expect(btn).toBeDisabled();
    });
  });

  it('network error shows error message', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText('Network error. Please try again.')).toBeInTheDocument();
  });

  it('shows error with role=alert when submission fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error occurred' }),
    });
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Server error occurred');
  });
});
