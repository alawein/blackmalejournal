import { render, screen, fireEvent } from '@testing-library/react';
import { DownloadForm } from '@/app/(auth)/admin/downloads/DownloadForm';
import type { Download } from '@/lib/supabase/types';

// Mock useFormStatus to avoid needing a real form action context
jest.mock('react-dom', () => {
  const actual = jest.requireActual('react-dom');
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

const mockAction = jest.fn();

const mockDownload: Download = {
  id: 'dl-abc-123',
  title: 'Test Download Title',
  slug: 'test-download-title',
  description: 'A short description.',
  category: 'template',
  file_url: 'downloads/test-file.pdf',
  file_type: 'pdf',
  file_size: 1048576,
  access_tier: 'free',
  cover_image: 'covers/test.webp',
  published_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-10T00:00:00Z',
};

describe('DownloadForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<DownloadForm action={mockAction} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/download file/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/file type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/file size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/access tier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument();
  });

  it('shows "Create Download" button when no download provided', () => {
    render(<DownloadForm action={mockAction} />);

    expect(
      screen.getByRole('button', { name: /create download/i }),
    ).toBeInTheDocument();
  });

  it('shows "Update Download" button when download provided', () => {
    render(<DownloadForm download={mockDownload} action={mockAction} />);

    expect(
      screen.getByRole('button', { name: /update download/i }),
    ).toBeInTheDocument();
  });

  it('pre-fills fields when download is provided', () => {
    render(<DownloadForm download={mockDownload} action={mockAction} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Download Title');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('test-download-title');
    expect(screen.getByLabelText(/description/i)).toHaveValue('A short description.');
    expect(screen.getByLabelText(/category/i)).toHaveValue('template');
    expect(screen.getByLabelText(/download file/i)).toHaveValue('downloads/test-file.pdf');
    expect(screen.getByLabelText(/file type/i)).toHaveValue('pdf');
    expect(screen.getByLabelText(/file size/i)).toHaveValue(1048576);
    expect(screen.getByLabelText(/access tier/i)).toHaveValue('free');
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toHaveValue(
      '2026-01-15T00:00',
    );
    expect(screen.getByLabelText(/cover image/i)).toHaveValue('covers/test.webp');
  });

  it('auto-generates slug from title on blur when slug is empty', () => {
    render(<DownloadForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(titleInput, {
      target: { value: 'My New Download Title' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('my-new-download-title');
  });

  it('does not overwrite slug if already filled', () => {
    render(<DownloadForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(slugInput, { target: { value: 'custom-slug' } });
    fireEvent.change(titleInput, {
      target: { value: 'My New Download Title' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('custom-slug');
  });

  it('includes hidden id field in edit mode', () => {
    const { container } = render(
      <DownloadForm download={mockDownload} action={mockAction} />,
    );

    const hiddenInput = container.querySelector('input[name="id"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveValue('dl-abc-123');
  });

  it('does not include hidden id field in create mode', () => {
    const { container } = render(<DownloadForm action={mockAction} />);

    const hiddenInput = container.querySelector('input[name="id"]');
    expect(hiddenInput).not.toBeInTheDocument();
  });

  it('shows description character count', () => {
    render(<DownloadForm action={mockAction} />);

    expect(screen.getByText('0/500')).toBeInTheDocument();

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Hello world' } });

    expect(screen.getByText('11/500')).toBeInTheDocument();
  });
});
