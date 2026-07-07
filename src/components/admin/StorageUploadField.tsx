'use client';

import { useId, useRef, useState, type DragEvent } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon } from 'lucide-react';
import type { StorageBucket } from '@/lib/supabase/storage';
import { cn } from '@/lib/utils';

type UploadBucket = Exclude<StorageBucket, 'avatars'>;

export interface StorageUploadResult {
  bucket: UploadBucket;
  path: string;
  url?: string;
  name: string;
  size: number;
  contentType: string;
}

interface StorageUploadFieldProps {
  bucket: UploadBucket;
  folder: string;
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  accept?: string;
  required?: boolean;
  helperText?: string;
  onUploaded?: (result: StorageUploadResult) => void;
}

const inputClass =
  'w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none';

const labelClass =
  'mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan';

function isPreviewableUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

function isLikelyImage(value: string, file?: File | null): boolean {
  if (file?.type.startsWith('image/')) return true;
  const lower = value.toLowerCase();
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/.test(lower);
}

/**
 * Format byte count as a human-readable string (B / KB / MB / GB).
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function StorageUploadField({
  bucket,
  folder,
  label,
  name,
  defaultValue,
  placeholder,
  accept,
  required = false,
  helperText = 'Upload first. Paste a URL or storage path only if you need to override it.',
  onUploaded,
}: StorageUploadFieldProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(defaultValue ?? '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedSize, setUploadedSize] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  function handleSelectedFile(file: File | null) {
    setSelectedFile(file);
    setError('');
    setMessage('');
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleSelectedFile(file);
  }

  function handleRemove() {
    setValue('');
    setSelectedFile(null);
    setUploadedSize(null);
    setMessage('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError('Choose a file before uploading.');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('bucket', bucket);
      formData.set('folder', folder);
      formData.set('file', selectedFile);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json()) as
        | ({ error?: string } & Partial<StorageUploadResult>)
        | StorageUploadResult;
      const error = 'error' in payload ? payload.error : undefined;

      if (!response.ok || !payload.path || !payload.bucket || !payload.name) {
        setError(error ?? 'Upload failed. Please try again.');
        return;
      }

      const nextValue = payload.url ?? payload.path;
      setValue(nextValue);
      setUploadedSize(payload.size ?? selectedFile.size);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage(`Uploaded ${payload.name}.`);
      onUploaded?.(payload as StorageUploadResult);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const showImagePreview = value && isPreviewableUrl(value) && isLikelyImage(value, selectedFile);

  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>

      <div className="grid grid-cols-1 gap-3 border border-bmj-tan/20 bg-bmj-black/30 p-4">
        {/* Drag-and-drop zone + file picker */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col gap-3 border border-dashed p-4 transition-colors lg:flex-row lg:items-center',
            isDragging
              ? 'border-bmj-red bg-bmj-red/5'
              : 'border-bmj-tan/30 bg-bmj-black/20',
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Upload size={20} className="shrink-0 text-bmj-tan" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <label
                htmlFor={fileInputId}
                className="mb-1 block font-label text-micro uppercase tracking-widest text-bmj-tan"
              >
                Upload File — drag &amp; drop or browse
              </label>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept={accept}
                onChange={(event) => handleSelectedFile(event.target.files?.[0] ?? null)}
                className="block w-full font-body text-sm text-bmj-cream file:mr-4 file:border-0 file:bg-bmj-red file:px-4 file:py-2 file:font-label file:text-xs file:uppercase file:tracking-widest file:text-bmj-white"
              />
              {selectedFile && (
                <p className="mt-2 font-mono text-xs text-bmj-cream/70">
                  {selectedFile.name} &middot; {formatFileSize(selectedFile.size)}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        {/* Manual URL / path field */}
        <div>
          <input
            id={name}
            name={name}
            type="text"
            required={required}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={inputClass}
            placeholder={placeholder}
          />
          <p className="mt-2 font-body text-xs text-bmj-tan/80">{helperText}</p>
        </div>

        {message && (
          <p className="font-body text-xs text-bmj-amber">{message}</p>
        )}

        {error && (
          <p className="font-body text-xs text-bmj-red">{error}</p>
        )}

        {/* Uploaded / current value preview row */}
        {(value || uploading) && (
          <div className="flex items-start gap-4 border border-bmj-tan/15 bg-bmj-black/50 p-3">
            {/* Thumbnail or skeleton */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-bmj-tan/20 bg-bmj-black">
              {uploading ? (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-bmj-tan/20 via-bmj-tan/10 to-bmj-tan/20" />
              ) : showImagePreview ? (
                <Image
                  src={value}
                  alt="Uploaded preview"
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-bmj-tan/60">
                  <ImageIcon size={20} aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="min-w-0 flex-1">
              <p className="break-all font-mono text-xs text-bmj-cream/90">{value}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-bmj-tan/80">
                {uploadedSize !== null && <span>{formatFileSize(uploadedSize)}</span>}
                {isPreviewableUrl(value) && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-label text-bmj-cream underline underline-offset-4"
                  >
                    Preview
                  </a>
                )}
              </div>
            </div>

            {/* Remove button */}
            {value && !uploading && (
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove file"
                className="shrink-0 border border-bmj-tan/30 p-2 text-bmj-tan transition-colors hover:border-bmj-red hover:text-bmj-red"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
