import { render, screen, fireEvent } from '@testing-library/react';
import { VideoModal } from '@/components/content/VideoModal';

jest.mock('@/lib/content/videos', () => ({}));

const mockVideo = {
  id: '1',
  title: 'Test Video',
  youtubeId: 'abc123',
  description: 'Test description',
  publishedAt: '2026-03-01',
};

describe('VideoModal', () => {
  it('renders nothing when video is null', () => {
    const { container } = render(<VideoModal video={null} onClose={jest.fn()} />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders video title and description when video provided', () => {
    render(<VideoModal video={mockVideo} onClose={jest.fn()} />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders YouTube iframe with correct src', () => {
    render(<VideoModal video={mockVideo} onClose={jest.fn()} />);
    const iframe = screen.getByTitle('Test Video');
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abc123?autoplay=1&rel=0',
    );
  });

  it('calls onClose when Escape key pressed', () => {
    const onClose = jest.fn();
    render(<VideoModal video={mockVideo} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = jest.fn();
    render(<VideoModal video={mockVideo} onClose={onClose} />);
    const backdrop = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it('sets body overflow to hidden when open, restores on close', () => {
    const { unmount } = render(<VideoModal video={mockVideo} onClose={jest.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
