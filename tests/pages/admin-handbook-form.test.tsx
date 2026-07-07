import { fireEvent, render, screen } from '@testing-library/react';
import { HandbookForm } from '@/app/(auth)/admin/handbooks/HandbookForm';
import type { Handbook } from '@/lib/supabase/types';

jest.mock('react-dom', () => {
  const actual = jest.requireActual('react-dom');
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

const mockAction = jest.fn();

const mockHandbook: Handbook = {
  id: 'hb-123',
  title: 'Political Field Manual',
  slug: 'political-field-manual',
  lens: 'politics',
  description: 'A field manual for disciplined organizing.',
  body: 'Full handbook body.',
  access_tier: 'premium',
  status: 'published',
  author: 'The Chairman',
  cover_image: 'covers/handbook.webp',
  file_url: 'handbooks/files/field-manual.pdf',
  published_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-10T00:00:00Z',
};

describe('HandbookForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<HandbookForm action={mockAction} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lens/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/body/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/access tier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/handbook file/i)).toBeInTheDocument();
  });

  it('pre-fills fields when handbook is provided', () => {
    render(<HandbookForm handbook={mockHandbook} action={mockAction} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Political Field Manual');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('political-field-manual');
    expect(screen.getByLabelText(/lens/i)).toHaveValue('politics');
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'A field manual for disciplined organizing.',
    );
    expect(screen.getByLabelText(/body/i)).toHaveValue('Full handbook body.');
    expect(screen.getByLabelText(/access tier/i)).toHaveValue('premium');
    expect(screen.getByLabelText(/status/i)).toHaveValue('published');
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toHaveValue(
      '2026-01-15T00:00',
    );
    expect(screen.getByLabelText(/cover image/i)).toHaveValue('covers/handbook.webp');
    expect(screen.getByLabelText(/handbook file/i)).toHaveValue(
      'handbooks/files/field-manual.pdf',
    );
  });

  it('auto-generates slug from title on blur when slug is empty', () => {
    render(<HandbookForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(titleInput, {
      target: { value: 'New Handbook Title' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('new-handbook-title');
  });

  it('shows description character count', () => {
    render(<HandbookForm action={mockAction} />);

    expect(screen.getByText('0/500')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Hello world' },
    });
    expect(screen.getByText('11/500')).toBeInTheDocument();
  });
});
