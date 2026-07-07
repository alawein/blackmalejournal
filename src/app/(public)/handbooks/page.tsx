import { redirect } from 'next/navigation';
import { PATHS, withQuery } from '@/lib/paths';

export default function HandbooksPage() {
  redirect(withQuery(PATHS.DOWNLOADS, { category: 'handbook' }));
}
