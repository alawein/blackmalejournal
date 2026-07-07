// tests/components/ScrollReveal.test.tsx
import { render, screen } from '@testing-library/react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

describe('ScrollReveal', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;

    global.IntersectionObserver = class {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    } as unknown as typeof IntersectionObserver;
  });

  it('renders children', () => {
    render(
      <ScrollReveal>
        <p>Hello</p>
      </ScrollReveal>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('passes className to wrapper', () => {
    const { container } = render(
      <ScrollReveal className="mt-8">
        <p>Content</p>
      </ScrollReveal>,
    );
    const el = container.firstElementChild;
    expect(el).toHaveClass('mt-8');
  });

  it('renders as a section element when as="section"', () => {
    const { container } = render(
      <ScrollReveal as="section">
        <p>Section content</p>
      </ScrollReveal>,
    );
    expect(container.querySelector('section')).toBeTruthy();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });
});
