import type { Metadata } from 'next';
import { BriefingForm } from '../BriefingForm';
import { createBriefingAction } from '../actions';

export const metadata: Metadata = {
  title: 'New Briefing — Admin',
  robots: { index: false, follow: false },
};

export default function NewBriefingPage() {
  return (
    <div>
      <h1 className="mb-8 font-display text-4xl text-bmj-white">NEW BRIEFING</h1>
      <BriefingForm action={createBriefingAction} />
    </div>
  );
}
