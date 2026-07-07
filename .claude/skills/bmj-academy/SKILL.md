---
name: bmj-academy
description: Use when building or extending the academy — courses, lessons, learning paths, lesson progression. Triggers on "academy", "course", "lesson", "curriculum", "learning", "education module".
---

# BMJ Academy

How courses and lessons are structured and rendered.

## Doc context (Tier A/B)

[AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md). **Task-scoped:** [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) (routing, data flow); types in `src/lib/supabase/types.ts`.

## Data Model

```
Course (1) ──→ (many) Lesson
```

**Course:** title, slug, description, access_tier, status, cover_image
**Lesson:** title, slug, body, course_id, order, access_tier

Lessons are ordered by the `order` field within a course.

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/academy` | Listing | All published courses |
| `/academy/[slug]` | Course detail | Course info + lesson list |
| `/academy/[slug]/[lessonSlug]` | Lesson detail | Lesson content |

## Queries

From `src/lib/supabase/queries.ts`:
- `getCourses()` — all published courses
- `getCourseBySlug(slug)` — single course with lessons
- `getLessonBySlug(courseSlug, lessonSlug)` — single lesson

## Access Control

Courses and lessons have independent `access_tier` fields:
- A free course can contain premium lessons
- Check access at the lesson level: `checkContentAccess(lesson.access_tier)`

## Rendering Pattern

Course detail page shows:
1. Course metadata (title, description, cover)
2. Lesson list with order numbers and access badges
3. Each lesson links to `/academy/[courseSlug]/[lessonSlug]`

Lesson detail page shows:
1. Breadcrumbs: Academy → Course → Lesson
2. Lesson body (markdown/prose)
3. Prev/Next navigation within the course

## Admin CRUD

- Routes: `src/app/(auth)/admin/courses/` and nested lesson routes
- Course form: `CourseForm.tsx`
- Lesson form: `LessonForm.tsx` (nested under course: `/admin/courses/[id]/lessons/`)
- Actions: `src/app/(auth)/admin/courses/actions.ts` and `lessons/actions.ts`

## Seed Data

```bash
# SQL seeds
supabase/seed-courses.sql
supabase/seed-lessons.sql

# Or via script
npx tsx scripts/seed-all.ts  # includes courses + lessons
```

## Adding a New Course

1. Create course record (via admin UI or SQL)
2. Add lessons with sequential `order` values
3. Set `status: 'published'` when ready
4. Course appears automatically on `/academy`
