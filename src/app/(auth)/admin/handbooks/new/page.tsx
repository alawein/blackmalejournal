import type { Metadata } from 'next';
import { HandbookForm } from '../HandbookForm';
import { createHandbookAction } from '../actions';

export const metadata: Metadata = {
  title: 'New Handbook — Admin',
  robots: { index: false, follow: false },
};

export default function NewHandbookPage() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-widest text-bmj-white">NEW HANDBOOK</h1>
      <div className="mt-6">
        <HandbookForm action={createHandbookAction} />
      </div>
    </div>
  );
}
