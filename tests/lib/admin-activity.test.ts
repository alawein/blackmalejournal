import { buildAdminActivitySummary } from '@/lib/admin-activity';

describe('buildAdminActivitySummary', () => {
  it('summarizes a create event with status', () => {
    expect(
      buildAdminActivitySummary({
        action: 'created',
        entityType: 'article',
        next: {
          title: 'The New Order',
          status: 'review',
        },
      }),
    ).toBe('Created article "The New Order" as review.');
  });

  it('summarizes key update diffs', () => {
    expect(
      buildAdminActivitySummary({
        action: 'updated',
        entityType: 'briefing',
        previous: {
          title: 'Weekend Briefing 008',
          slug: 'weekend-briefing-008',
          status: 'draft',
          publishedAt: null,
        },
        next: {
          title: 'Weekend Briefing 008',
          slug: 'weekend-briefing-008',
          status: 'scheduled',
          publishedAt: '2026-04-01T12:30:00Z',
        },
      }),
    ).toBe(
      'Updated briefing "Weekend Briefing 008": status draft -> scheduled; publish time not set -> 2026-04-01 12:30 UTC.',
    );
  });

  it('falls back to a sensible summary when only the next snapshot is present', () => {
    expect(
      buildAdminActivitySummary({
        action: 'updated',
        entityType: 'download',
        next: {
          title: 'Field Manual PDF',
        },
      }),
    ).toBe('Updated download "Field Manual PDF".');
  });
});
