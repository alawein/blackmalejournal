import type { Metadata } from 'next';
import { DispatchForm } from '../DispatchForm';
import { createDispatchAction } from '../actions';

export const metadata: Metadata = {
  title: 'New Dispatch — Admin',
  robots: { index: false, follow: false },
};

export default function NewDispatchPage() {
  return (
    <div>
      <h1 className="mb-8 font-display text-4xl text-bmj-white">NEW DISPATCH</h1>
      <DispatchForm action={createDispatchAction} />
    </div>
  );
}
