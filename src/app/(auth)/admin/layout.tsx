import { PATHS } from '@/lib/paths';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/access';
import { getMemberById } from '@/lib/supabase/queries';
import { AdminNav } from './AdminNav';
import { ToastProvider } from '@/lib/toast';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect(`${PATHS.LOGIN}?redirect=${PATHS.ADMIN}`);
  }

  const member = await getMemberById(user.id);

  if (!member || (member.role !== 'admin' && member.role !== 'editor')) {
    redirect(PATHS.PORTAL);
  }

  const displayName = member.role === 'admin' ? 'The Chairman' : 'Editor';

  return (
    <ToastProvider>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AdminNav displayName={displayName} role={member.role} />
        <div className="flex-1 bg-bmj-brown/30 p-8">{children}</div>
      </div>
    </ToastProvider>
  );
}
