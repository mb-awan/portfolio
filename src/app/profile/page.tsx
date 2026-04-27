import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth/session';

import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/?auth=signIn&from=${encodeURIComponent('/profile')}`);
  }
  return (
    <div className="container max-w-2xl py-10">
      <ProfileForm initialUser={user} />
    </div>
  );
}
