import type { Metadata } from 'next';
import { ArticleForm } from '../ArticleForm';
import { createArticleAction } from '../actions';

export const metadata: Metadata = {
  title: 'New Article — Admin',
  robots: { index: false, follow: false },
};

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="mb-8 font-display text-4xl text-bmj-white">NEW ARTICLE</h1>
      <ArticleForm action={createArticleAction} />
    </div>
  );
}
