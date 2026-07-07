interface AdminNoticeProps {
  title: string;
  message: string;
  tone: 'success' | 'error';
}

const toneClasses: Record<AdminNoticeProps['tone'], string> = {
  success: 'border-bmj-olive/40 bg-bmj-olive/10 text-bmj-cream',
  error: 'border-bmj-red/40 bg-bmj-red/10 text-bmj-cream',
};

export function AdminNotice({ title, message, tone }: AdminNoticeProps) {
  return (
    <div className={`mt-6 border p-4 ${toneClasses[tone]}`}>
      <p className="font-label text-xs uppercase tracking-widest">
        {title}
      </p>
      <p className="mt-2 font-body text-sm">{message}</p>
    </div>
  );
}
