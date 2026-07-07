import type { MetadataRoute } from 'next';
import {
  PATHS,
  siteAbsoluteUrl,
  articlePath,
  briefingPath,
  academyCoursePath,
  dispatchPath,
  handbookPath,
  academyLessonPath,
} from '@/lib/paths';
import {
  getArticlesForListing,
  getBriefingsForSitemap,
  getCourses,
  getDispatchesForListing,
  getHandbooksForSitemap,
  getLessonsByCourse,
} from '@/lib/supabase/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteAbsoluteUrl(PATHS.HOME), changeFrequency: 'daily', priority: 1.0 },
    { url: siteAbsoluteUrl(PATHS.ARTICLES), changeFrequency: 'daily', priority: 0.9 },
    { url: siteAbsoluteUrl(PATHS.BRIEFINGS), changeFrequency: 'weekly', priority: 0.9 },
    { url: siteAbsoluteUrl(PATHS.ACADEMY), changeFrequency: 'weekly', priority: 0.7 },
    { url: siteAbsoluteUrl(PATHS.VIDEO), changeFrequency: 'weekly', priority: 0.7 },
    { url: siteAbsoluteUrl(PATHS.BLOG), changeFrequency: 'daily', priority: 0.8 },
    { url: siteAbsoluteUrl(PATHS.ABOUT), changeFrequency: 'monthly', priority: 0.6 },
    { url: siteAbsoluteUrl(PATHS.HANDBOOKS), changeFrequency: 'weekly', priority: 0.7 },
    { url: siteAbsoluteUrl(PATHS.DOWNLOADS), changeFrequency: 'weekly', priority: 0.5 },
    { url: siteAbsoluteUrl(PATHS.RECORDS), changeFrequency: 'weekly', priority: 0.6 },
    { url: siteAbsoluteUrl(PATHS.PRICING), changeFrequency: 'monthly', priority: 0.5 },
    { url: siteAbsoluteUrl(PATHS.CONTACT), changeFrequency: 'monthly', priority: 0.4 },
    { url: siteAbsoluteUrl(PATHS.SUPPORT), changeFrequency: 'monthly', priority: 0.4 },
    { url: siteAbsoluteUrl(PATHS.PRIVACY), changeFrequency: 'yearly', priority: 0.2 },
    { url: siteAbsoluteUrl(PATHS.TERMS), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [articles, briefings, courses, dispatches, handbooks] = await Promise.all([
    getArticlesForListing({ limit: 500 }),
    getBriefingsForSitemap({ limit: 200 }),
    getCourses({ published: true }),
    getDispatchesForListing({ limit: 500 }),
    getHandbooksForSitemap({ limit: 200 }),
  ]);

  // Fetch lessons for each published course
  const courseLessons = await Promise.all(
    courses.map(async (c) => {
      const lessons = await getLessonsByCourse(c.id);
      return lessons.map((l) => ({ courseSlug: c.slug, lesson: l }));
    }),
  );
  const allLessons = courseLessons.flat();

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: siteAbsoluteUrl(articlePath(a.slug)),
    lastModified: a.published_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const briefingEntries: MetadataRoute.Sitemap = briefings.map((b) => ({
    url: siteAbsoluteUrl(briefingPath(b.slug)),
    lastModified: b.published_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: siteAbsoluteUrl(academyCoursePath(c.slug)),
    lastModified: c.created_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const dispatchEntries: MetadataRoute.Sitemap = dispatches.map((d) => ({
    url: siteAbsoluteUrl(dispatchPath(d.slug)),
    lastModified: d.published_at,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const handbookEntries: MetadataRoute.Sitemap = handbooks.map((h) => ({
    url: siteAbsoluteUrl(handbookPath(h.slug)),
    lastModified: h.published_at,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const lessonEntries: MetadataRoute.Sitemap = allLessons.map(({ courseSlug, lesson }) => ({
    url: siteAbsoluteUrl(academyLessonPath(courseSlug, lesson.slug)),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...articleEntries,
    ...briefingEntries,
    ...courseEntries,
    ...dispatchEntries,
    ...handbookEntries,
    ...lessonEntries,
  ];
}
