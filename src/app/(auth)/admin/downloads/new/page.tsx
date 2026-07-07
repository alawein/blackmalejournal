import type { Metadata } from 'next';
import { DownloadForm } from '../DownloadForm';
import { createDownloadAction } from '../actions';

export const metadata: Metadata = {
  title: 'New Download — Admin',
  robots: { index: false, follow: false },
};

export default function NewDownloadPage() {
  return (
    <div>
      <h1 className="mb-8 font-display text-4xl text-bmj-white">NEW DOWNLOAD</h1>
      <DownloadForm action={createDownloadAction} />
    </div>
  );
}
