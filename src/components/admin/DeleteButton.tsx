'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  action: () => Promise<void>;
  itemName: string;
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="border border-bmj-red bg-bmj-red px-4 py-2 font-mono text-xs uppercase tracking-widest text-bmj-white disabled:opacity-60"
    >
      {pending ? 'Deleting...' : 'Yes, Delete'}
    </button>
  );
}

export function DeleteButton({ action, itemName }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 border border-bmj-red px-4 py-2 font-mono text-xs uppercase tracking-widest text-bmj-red"
      >
        <Trash2 size={14} />
        Delete
      </button>
    );
  }

  return (
    <div className="border border-bmj-red bg-bmj-brown p-4">
      <p className="mb-4 font-body text-sm text-bmj-cream">
        Are you sure you want to delete this {itemName}? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <form action={action}>
          <ConfirmButton />
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="border border-bmj-tan px-4 py-2 font-mono text-xs uppercase tracking-widest text-bmj-tan"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
