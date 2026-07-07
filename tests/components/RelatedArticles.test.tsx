import { render, screen } from '@testing-library/react';
import { RelatedArticles } from '@/components/content/RelatedArticles';

const mockArticles = [
  {
    id: '1', title: 'Related Article 1', slug: 'related-1', lens: 'health' as const,
    excerpt: 'An excerpt', tags: [], body: 'Body text for reading time',
    featured: false, access_tier: 'free' as const, author: 'The Chairman',
    status: 'published' as const,
    cover_image: null, published_at: '2026-01-01', created_at: '2026-01-01',
  },
];

describe('RelatedArticles', () => {
  test('renders section heading with lens name', () => {
    render(<RelatedArticles articles={mockArticles} lens="health" />);
    expect(screen.getByText(/more from health/i)).toBeInTheDocument();
  });

  test('renders article links', () => {
    render(<RelatedArticles articles={mockArticles} lens="health" />);
    expect(screen.getByText('Related Article 1')).toBeInTheDocument();
  });

  test('renders nothing when no articles', () => {
    const { container } = render(<RelatedArticles articles={[]} lens="health" />);
    expect(container.firstChild).toBeNull();
  });
});
