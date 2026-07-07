import { render, screen, fireEvent } from '@testing-library/react';
import { DispatchForm } from '@/app/(auth)/admin/dispatches/DispatchForm';
import type { Dispatch } from '@/lib/supabase/types';

// Mock useFormStatus to avoid needing a real form action context
jest.mock('react-dom', () => {
  const actual = jest.requireActual('react-dom');
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

const mockAction = jest.fn();

const mockDispatch: Dispatch = {
  id: 'dsp-abc-123',
  title: 'Test Dispatch Title',
  slug: 'test-dispatch-title',
  lens: 'culture',
  excerpt: 'A short excerpt.',
  body: 'Full dispatch body content here.',
  status: 'published',
  author: 'The Chairman',
  cover_image: 'covers/test.webp',
  published_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-10T00:00:00Z',
};

describe('DispatchForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<DispatchForm action={mockAction} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lens/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/excerpt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/body/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument();
  });

  it('shows "Create Dispatch" button when no dispatch provided', () => {
    render(<DispatchForm action={mockAction} />);

    expect(
      screen.getByRole('button', { name: /create dispatch/i }),
    ).toBeInTheDocument();
  });

  it('shows "Update Dispatch" button when dispatch provided', () => {
    render(<DispatchForm dispatch={mockDispatch} action={mockAction} />);

    expect(
      screen.getByRole('button', { name: /update dispatch/i }),
    ).toBeInTheDocument();
  });

  it('pre-fills fields when dispatch is provided', () => {
    render(<DispatchForm dispatch={mockDispatch} action={mockAction} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Dispatch Title');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('test-dispatch-title');
    expect(screen.getByLabelText(/lens/i)).toHaveValue('culture');
    expect(screen.getByLabelText(/excerpt/i)).toHaveValue('A short excerpt.');
    expect(screen.getByLabelText(/body/i)).toHaveValue(
      'Full dispatch body content here.',
    );
    expect(screen.getByLabelText(/status/i)).toHaveValue('published');
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toHaveValue(
      '2026-01-15T00:00',
    );
    expect(screen.getByLabelText(/cover image/i)).toHaveValue(
      'covers/test.webp',
    );
  });

  it('auto-generates slug from title on blur when slug is empty', () => {
    render(<DispatchForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(titleInput, {
      target: { value: 'My New Dispatch Title' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('my-new-dispatch-title');
  });

  it('does not overwrite slug if already filled', () => {
    render(<DispatchForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(slugInput, { target: { value: 'custom-slug' } });
    fireEvent.change(titleInput, {
      target: { value: 'My New Dispatch Title' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('custom-slug');
  });

  it('includes hidden id field in edit mode', () => {
    const { container } = render(
      <DispatchForm dispatch={mockDispatch} action={mockAction} />,
    );

    const hiddenInput = container.querySelector('input[name="id"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveValue('dsp-abc-123');
  });

  it('does not include hidden id field in create mode', () => {
    const { container } = render(<DispatchForm action={mockAction} />);

    const hiddenInput = container.querySelector('input[name="id"]');
    expect(hiddenInput).not.toBeInTheDocument();
  });

  it('shows excerpt character count', () => {
    render(<DispatchForm action={mockAction} />);

    expect(screen.getByText('0/500')).toBeInTheDocument();

    const excerptInput = screen.getByLabelText(/excerpt/i);
    fireEvent.change(excerptInput, { target: { value: 'Hello world' } });

    expect(screen.getByText('11/500')).toBeInTheDocument();
  });
});
