import { User } from '@/models/User';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionUser } from '@/lib/auth/session';
import { connectMongo } from '@/lib/db/mongoose';

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
  const session = await getSessionUser();
  await connectMongo();
  const totalUsers = await User.countDocuments();
  const canViewUsers = session?.permissions.includes('users.view') ?? false;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of the admin area. More modules (blog, courses, etc.) can plug in here later.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Registered accounts in the database.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-3xl font-semibold tabular-nums">{totalUsers}</p>
          {canViewUsers ? (
            <Button asChild variant="secondary">
              <Link href="/admin/users">Manage users</Link>
            </Button>
          ) : (
            <p className="max-w-xs text-xs text-muted-foreground">
              Your role does not include user listing. Ask a full administrator to grant{' '}
              <span className="font-mono text-[0.7rem]">users.view</span>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
