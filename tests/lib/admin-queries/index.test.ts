// Verify the barrel re-export exposes all expected functions.
// No Supabase mock needed — this is a static import check.

import * as adminQueries from '@/lib/supabase/admin-queries';

describe('admin-queries barrel export', () => {
  const expectedExports = [
    // articles
    'getAllArticles',
    'getArticleById',
    'getArticlesByIds',
    'createArticle',
    'updateArticle',
    'deleteArticle',
    'bulkUpdateArticleStatuses',
    // briefings
    'getAllBriefings',
    'getBriefingById',
    'getBriefingsByIds',
    'createBriefing',
    'updateBriefing',
    'deleteBriefing',
    'bulkUpdateBriefingStatuses',
    // dispatches
    'getAllDispatches',
    'getDispatchById',
    'getDispatchesByIds',
    'createDispatch',
    'updateDispatch',
    'deleteDispatch',
    'bulkUpdateDispatchStatuses',
    // downloads
    'getAllDownloads',
    'getDownloadById',
    'getDownloadsByIds',
    'createDownload',
    'updateDownload',
    'deleteDownload',
    'bulkUpdateDownloadAccessTiers',
    // handbooks
    'getAllHandbooks',
    'getHandbookById',
    'getHandbooksByIds',
    'createHandbook',
    'updateHandbook',
    'deleteHandbook',
    'bulkUpdateHandbookStatuses',
    // courses
    'getAllCourses',
    'getCourseById',
    'createCourse',
    'updateCourse',
    'deleteCourse',
    'getLessonsForAdminCourse',
    'getLessonById',
    'createLesson',
    'updateLesson',
    'deleteLesson',
    // members
    'getAllMembers',
    'getAdminMemberById',
    'updateAdminMember',
    'countAdminMembers',
    'getMemberCount',
    // contact-submissions
    'getAllContactSubmissions',
    'updateContactSubmission',
    'getContactSubmissionCounts',
    // subscribers
    'getAllSubscribers',
    'getSubscriberCounts',
    // activity-log
    'createAdminActivityLogEntry',
    'getAdminActivityLogForEntity',
    // counts
    'getContentCounts',
    // insights
    'getAdminContentPipelineInsights',
    'getMemberAdminInsights',
    'getMessageAdminInsights',
    'getSubscriberAdminInsights',
    'getAdminCommandCenterSnapshot',
  ];

  it.each(expectedExports)('exports %s', (name) => {
    expect(adminQueries).toHaveProperty(name);
    expect(typeof (adminQueries as Record<string, unknown>)[name]).toBe('function');
  });
});
