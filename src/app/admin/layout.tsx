import { type PropsWithChildren } from 'react';

import { redirect } from 'next/navigation';

import { AdminShell } from '@/components/admin/admin-shell';
import { getSessionUser } from '@/lib/auth/session';

export default async function AdminLayout({ children }: PropsWithChildren): Promise<React.JSX.Element> {
  const session = await getSessionUser();
  if (!session) {
    redirect('/?auth=signIn&from=/admin');
  }
  if (!session.permissions.includes('admin.access')) {
    redirect('/');
  }

  return <AdminShell>{children}</AdminShell>;
}
