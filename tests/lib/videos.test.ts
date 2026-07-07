import { videos } from '@/lib/content/videos';
import type { Video } from '@/lib/content/videos';

// ── Video data integrity ─────────────────────────────────────────────────────

describe('videos data', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(videos)).toBe(true);
    expect(videos.length).toBeGreaterThan(0);
  });

  it('every video has required fields', () => {
    for (const video of videos) {
      expect(video.id).toBeTruthy();
      expect(video.title).toBeTruthy();
      expect(video.youtubeId).toBeTruthy();
      expect(video.description).toBeTruthy();
      expect(video.publishedAt).toBeTruthy();
    }
  });

  it('all IDs are unique', () => {
    const ids = videos.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('publishedAt values are valid date strings', () => {
    for (const video of videos) {
      const date = new Date(video.publishedAt);
      expect(date.toString()).not.toBe('Invalid Date');
    }
  });
});
