import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewsletterForm } from '@/components/layout/NewsletterForm';

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('NewsletterForm', () => {
  it('renders email input and subscribe button', () => {
    render(<NewsletterForm />);
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('shows "Subscribing..." during loading', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<NewsletterForm />);
    const input = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }));
    await waitFor(() => {
      expect(screen.getByText(/Subscribing[\u2026.]/)).toBeInTheDocument();
    });
  });

  it('shows success message on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    render(<NewsletterForm />);
    const input = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }));
    expect(await screen.findByText(/you're in/i)).toBeInTheDocument();
  });

  it('shows error message on error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Already subscribed' }),
    });
    render(<NewsletterForm />);
    const input = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }));
    expect(await screen.findByText('Already subscribed')).toBeInTheDocument();
  });

  it('passes source prop to API call', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    render(<NewsletterForm source="hero-section" />);
    const input = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(input, { target: { value: ' Test@Example.com ' } });
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/newsletter/subscribe', expect.objectContaining({
        body: JSON.stringify({ email: 'test@example.com', source: 'hero-section' }),
      }));
    });
  });

  it('clears email on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    render(<NewsletterForm />);
    const input = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }));
    // After success, the form is replaced with a success message
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('your@email.com')).not.toBeInTheDocument();
    });
  });

  it('shows error for invalid email on blur', async () => {
    render(<NewsletterForm />);
    const input = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(input, { target: { value: 'notanemail' } });
    fireEvent.blur(input);
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
  });

  it('clears error when valid email entered', async () => {
    render(<NewsletterForm />);
    const input = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(input, { target: { value: 'notanemail' } });
    fireEvent.blur(input);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('has aria-invalid when validation error exists', () => {
    render(<NewsletterForm />);
    const input = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.blur(input);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
