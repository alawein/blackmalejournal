import { render, screen, fireEvent, act } from '@testing-library/react';
import { BackToTop } from '@/components/ui/BackToTop';

describe('BackToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  test('is hidden when at top of page', () => {
    render(<BackToTop />);
    expect(screen.queryByRole('button', { name: /back to top/i })).not.toBeInTheDocument();
  });

  test('appears after scrolling past threshold', () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByRole('button', { name: /back to top/i })).toBeInTheDocument();
  });

  test('calls scrollTo when clicked', () => {
    window.scrollTo = jest.fn();
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    fireEvent.click(screen.getByRole('button', { name: /back to top/i }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  test('does not use drop shadows (brand compliance)', () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button.className).not.toMatch(/shadow/);
  });
});
