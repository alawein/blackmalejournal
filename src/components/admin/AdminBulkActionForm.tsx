'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

type BulkOption = {
  label: string;
  value: string;
};

interface AdminBulkActionFormProps {
  action: (formData: FormData) => Promise<void>;
  returnPath: string;
  fieldName: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  helper: string;
  itemLabel: string;
  submitLabel: string;
  options: BulkOption[];
  children: React.ReactNode;
}

function BulkSubmitButton({
  disabled,
  label,
}: {
  disabled: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Applying...' : label}
    </button>
  );
}

export function AdminBulkActionForm({
  action,
  returnPath,
  fieldName,
  fieldLabel,
  fieldPlaceholder,
  helper,
  itemLabel,
  submitLabel,
  options,
  children,
}: AdminBulkActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const syncSelection = () => {
      const checkboxes = Array.from(
        form.querySelectorAll<HTMLInputElement>('input[data-bulk-item="true"]'),
      );
      const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
      const totalCount = checkboxes.length;

      setSelectedCount(checkedCount);
      setAllSelected(totalCount > 0 && checkedCount === totalCount);

      if (selectAllRef.current) {
        selectAllRef.current.indeterminate =
          checkedCount > 0 && checkedCount < totalCount;
      }
    };

    syncSelection();
    form.addEventListener('change', syncSelection);

    return () => {
      form.removeEventListener('change', syncSelection);
    };
  }, []);

  const toggleAll = (checked: boolean) => {
    const form = formRef.current;
    if (!form) return;

    const checkboxes = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[data-bulk-item="true"]'),
    );

    checkboxes.forEach((checkbox) => {
      checkbox.checked = checked;
    });

    setSelectedCount(checked ? checkboxes.length : 0);
    setAllSelected(checked && checkboxes.length > 0);

    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = false;
    }
  };

  return (
    <form ref={formRef} action={action} className="mt-6">
      <input type="hidden" name="return_path" value={returnPath} />

      <section className="border border-bmj-tan/20 bg-bmj-brown p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
              Bulk Actions
            </p>
            <p className="mt-2 font-body text-sm text-bmj-cream/80">
              {selectedCount} {itemLabel} selected on this page.
            </p>
          </div>

          <label className="inline-flex items-center gap-3 font-label text-xs uppercase tracking-widest text-bmj-cream">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={(event) => toggleAll(event.target.checked)}
              className="h-4 w-4 border border-bmj-tan/40 bg-bmj-black accent-bmj-red"
            />
            Select Page
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label
              htmlFor={fieldName}
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              {fieldLabel}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              defaultValue=""
              required
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
            >
              <option value="" disabled>
                {fieldPlaceholder}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <BulkSubmitButton disabled={selectedCount === 0} label={submitLabel} />
          </div>
        </div>

        <p className="mt-3 font-body text-sm text-bmj-cream/70">{helper}</p>
      </section>

      <div className="mt-6">{children}</div>
    </form>
  );
}
