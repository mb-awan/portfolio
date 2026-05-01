import { redirect } from 'next/navigation';

import { AdminUsersClient } from '@/app/admin/users/admin-users-client';
import { getSessionUser } from '@/lib/auth/session';

export default async function AdminUsersPage(): Promise<React.JSX.Element> {
  const session = await getSessionUser();
  if (!session?.permissions.includes('users.view')) {
    redirect('/admin');
  }
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">User management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search, verify emails, and assign roles.</p>
      </div>
      <AdminUsersClient
        canAssignRole={session.permissions.includes('users.assign_role')}
        canEdit={session.permissions.includes('users.edit')}
      />
    </div>
  );
}
