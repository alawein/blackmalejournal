import { render, screen, fireEvent } from '@testing-library/react';
import { BriefingForm } from '@/app/(auth)/admin/briefings/BriefingForm';
import type { Briefing } from '@/lib/supabase/types';

// Mock useFormStatus to avoid needing a real form action context
jest.mock('react-dom', () => {
  const actual = jest.requireActual('react-dom');
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

const mockAction = jest.fn();

const mockBriefing: Briefing = {
  id: 'br-1',
  issue_number: 3,
  title: 'Weekend Briefing 003',
  slug: 'weekend-briefing-003',
  sections: [
    { title: 'Opening', body: 'Welcome to issue 3.' },
    { title: 'Politics', body: 'Political analysis here.' },
  ],
  lead_kicker: 'Opening',
  access_tier: 'free',
  status: 'published',
  cover_image: 'covers/briefing-003.webp',
  published_at: '2026-03-15T00:00:00Z',
  created_at: '2026-03-14T00:00:00Z',
};

describe('BriefingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields including sections editor', () => {
    render(<BriefingForm action={mockAction} />);

    expect(screen.getByLabelText(/issue number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/access tier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument();
    // Default section
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByLabelText(/section title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section body/i)).toBeInTheDocument();
  });

  it('shows "Create Briefing" button when no briefing provided', () => {
    render(<BriefingForm action={mockAction} />);

    expect(
      screen.getByRole('button', { name: /create briefing/i }),
    ).toBeInTheDocument();
  });

  it('shows "Update Briefing" button when briefing provided', () => {
    render(<BriefingForm briefing={mockBriefing} action={mockAction} />);

    expect(
      screen.getByRole('button', { name: /update briefing/i }),
    ).toBeInTheDocument();
  });

  it('pre-fills fields when briefing is provided', () => {
    render(<BriefingForm briefing={mockBriefing} action={mockAction} />);

    expect(screen.getByLabelText(/issue number/i)).toHaveValue(3);
    expect(screen.getByLabelText(/^title$/i)).toHaveValue('Weekend Briefing 003');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('weekend-briefing-003');
    expect(screen.getByLabelText(/access tier/i)).toHaveValue('free');
    expect(screen.getByLabelText(/status/i)).toHaveValue('published');
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toHaveValue(
      '2026-03-15T00:00',
    );
    expect(screen.getByLabelText(/cover image/i)).toHaveValue(
      'covers/briefing-003.webp',
    );
    // Two sections from mock data
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('auto-generates slug from title on blur when slug is empty', () => {
    render(<BriefingForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/^title$/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(titleInput, {
      target: { value: 'Weekend Briefing 010' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('weekend-briefing-010');
  });

  it('does not overwrite slug if already filled', () => {
    render(<BriefingForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/^title$/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(slugInput, { target: { value: 'custom-slug' } });
    fireEvent.change(titleInput, {
      target: { value: 'Weekend Briefing 010' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('custom-slug');
  });

  it('adds and removes sections', () => {
    render(<BriefingForm action={mockAction} />);

    // Start with 1 section
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.queryByText('Section 2')).not.toBeInTheDocument();

    // Add a section
    fireEvent.click(screen.getByText('+ Add Section'));
    expect(screen.getByText('Section 2')).toBeInTheDocument();

    // Remove the second section
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[1]);
    expect(screen.queryByText('Section 2')).not.toBeInTheDocument();
  });

  it('includes hidden id field in edit mode', () => {
    const { container } = render(
      <BriefingForm briefing={mockBriefing} action={mockAction} />,
    );

    const hiddenInput = container.querySelector('input[name="id"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveValue('br-1');
  });

  it('does not include hidden id field in create mode', () => {
    const { container } = render(<BriefingForm action={mockAction} />);

    const hiddenInput = container.querySelector('input[name="id"]');
    expect(hiddenInput).not.toBeInTheDocument();
  });

  it('serializes sections to hidden sections_json field', () => {
    const { container } = render(
      <BriefingForm briefing={mockBriefing} action={mockAction} />,
    );

    const hiddenSections = container.querySelector(
      'input[name="sections_json"]',
    ) as HTMLInputElement;
    expect(hiddenSections).toBeInTheDocument();
    const parsed = JSON.parse(hiddenSections.value);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].title).toBe('Opening');
    expect(parsed[1].title).toBe('Politics');
  });
});
