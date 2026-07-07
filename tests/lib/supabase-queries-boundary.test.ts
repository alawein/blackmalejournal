import type { SearchResult } from '@/lib/supabase/types';

import * as queries from '@/lib/supabase/queries';

describe('queries barrel exports', () => {
  it('exposes content-domain query contracts', () => {
    expect(typeof queries.getArticles).toBe('function');
    expect(typeof queries.getArticleBySlug).toBe('function');
    expect(typeof queries.getBriefings).toBe('function');
    expect(typeof queries.getCourses).toBe('function');
    expect(typeof queries.getLessonsByCourse).toBe('function');
    expect(typeof queries.getDispatches).toBe('function');
    expect(typeof queries.getDispatchesForListing).toBe('function');
    expect(typeof queries.getHandbooks).toBe('function');
    expect(typeof queries.getDownloads).toBe('function');
  });

  it('exposes member and contact contracts', () => {
    expect(typeof queries.getMemberById).toBe('function');
    expect(typeof queries.updateMemberTier).toBe('function');
    expect(typeof queries.subscribeToNewsletter).toBe('function');
    expect(typeof queries.submitContactForm).toBe('function');
  });

  it('exposes search contracts', () => {
    expect(typeof queries.searchContent).toBe('function');
    expect(typeof queries.searchContentFTS).toBe('function');
    const result: SearchResult = {
      type: 'article',
      title: 'Boundary',
      slug: 'boundary',
      excerpt: '',
      publishedAt: '2026-01-01',
    };
    expect(result).toHaveProperty('type', 'article');
  });
});
