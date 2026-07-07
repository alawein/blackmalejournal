import {
  assessArticleReadiness,
  assessBriefingReadiness,
  assessDownloadReadiness,
  assessHandbookReadiness,
  summarizePublishReadiness,
} from '@/lib/admin-publishing';
import type { Article, Briefing, Download, Handbook } from '@/lib/supabase/types';

describe('admin publishing helpers', () => {
  it('marks complete articles as ready', () => {
    const article: Article = {
      id: 'article-1',
      title: 'Discipline Is Direction',
      slug: 'discipline-is-direction',
      lens: 'culture',
      tags: ['discipline'],
      excerpt: 'A clear editorial line.',
      body: 'Full article body.',
      featured: false,
      access_tier: 'premium',
      status: 'published',
      author: 'The Chairman',
      cover_image: '/covers/article.jpg',
      published_at: '2026-03-25T10:00:00.000Z',
      created_at: '2026-03-24T10:00:00.000Z',
    };

    expect(assessArticleReadiness(article)).toMatchObject({
      status: 'ready',
      label: 'Ready',
    });
  });

  it('blocks briefings that are missing sections or scheduling data', () => {
    const briefing: Briefing = {
      id: 'briefing-1',
      issue_number: 0,
      title: 'Weekend Briefing 010',
      slug: 'weekend-briefing-010',
      sections: [{ title: '', body: '' }],
      lead_kicker: '',
      access_tier: 'basic',
      status: 'scheduled',
      cover_image: null,
      published_at: '',
      created_at: '2026-03-24T10:00:00.000Z',
    };

    const readiness = assessBriefingReadiness(briefing);
    expect(readiness.status).toBe('blocked');
    expect(readiness.blockingIssues).toEqual(
      expect.arrayContaining([
        'Missing issue number',
        'Missing cover image',
        'Missing populated sections',
        'Missing publish time',
      ]),
    );
  });

  it('warns when downloads are usable but missing presentation assets', () => {
    const download: Download = {
      id: 'download-1',
      title: 'Weekly Planner',
      slug: 'weekly-planner',
      description: 'A practical planning worksheet.',
      category: 'worksheet',
      file_url: 'downloads/weekly-planner.pdf',
      file_type: 'pdf',
      file_size: 1024,
      access_tier: 'free',
      cover_image: null,
      published_at: '2026-03-25T10:00:00.000Z',
      created_at: '2026-03-24T10:00:00.000Z',
    };

    expect(assessDownloadReadiness(download)).toMatchObject({
      status: 'warning',
      label: 'Review',
      summary: 'No cover image',
    });
  });

  it('blocks handbooks that are missing the downloadable file', () => {
    const handbook: Handbook = {
      id: 'handbook-1',
      title: 'Political Field Manual',
      slug: 'political-field-manual',
      lens: 'politics',
      description: 'Guidance for disciplined political work.',
      body: 'Full handbook body.',
      access_tier: 'premium',
      status: 'published',
      author: 'The Chairman',
      cover_image: '/covers/handbook.jpg',
      file_url: null,
      published_at: '2026-03-25T10:00:00.000Z',
      created_at: '2026-03-24T10:00:00.000Z',
    };

    expect(assessHandbookReadiness(handbook)).toMatchObject({
      status: 'blocked',
      summary: 'Missing handbook file',
    });
  });

  it('summarizes readiness totals by status', () => {
    expect(
      summarizePublishReadiness([
        { status: 'ready', label: 'Ready', summary: '', blockingIssues: [], advisoryIssues: [] },
        { status: 'warning', label: 'Review', summary: '', blockingIssues: [], advisoryIssues: [] },
        { status: 'blocked', label: 'Needs Work', summary: '', blockingIssues: ['Missing body'], advisoryIssues: [] },
      ]),
    ).toEqual({
      ready: 1,
      warning: 1,
      blocked: 1,
    });
  });
});
