'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { PublicUser } from '@/lib/auth/session';

import { AvatarCropDialog } from '@/app/profile/avatar-crop-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

type ProfileFormProps = {
  initialUser: PublicUser;
};

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [message, setMessage] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [tfaQr, setTfaQr] = useState<null | string>(null);
  const [tfaSecret, setTfaSecret] = useState<null | string>(null);
  const [tfaSetupOtp, setTfaSetupOtp] = useState('');
  const [tfaBusy, setTfaBusy] = useState(false);

  const [disablePassword, setDisablePassword] = useState('');
  const [disableOtp, setDisableOtp] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [cropObjectUrl, setCropObjectUrl] = useState<null | string>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/user/me', {
        body: JSON.stringify({ bio, name }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const data = (await res.json()) as { error?: string } & PublicUser;
      if (!res.ok) {
        setError(data.error ?? 'Could not save profile');
        return;
      }
      setUser((u) => ({
        ...u,
        bio: data.bio,
        email: data.email,
        emailVerified: data.emailVerified,
        id: data.id,
        imageUrl: data.imageUrl,
        name: data.name,
        tfaEnabled: data.tfaEnabled,
      }));
      setMessage('Profile updated');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  const endCrop = useCallback(() => {
    setCropObjectUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setCropOpen(false);
  }, []);

  useEffect(
    () => () => {
      if (cropObjectUrl) {
        URL.revokeObjectURL(cropObjectUrl);
      }
    },
    [cropObjectUrl]
  );

  async function uploadAvatarFile(file: File): Promise<boolean> {
    const form = new FormData();
    form.set('file', file);
    const upload = await fetch('/api/user/avatar', { body: form, method: 'POST' });
    const uploadData = (await upload.json()) as { error?: string; url?: string };
    if (!upload.ok) {
      setError(uploadData.error ?? 'Could not upload photo');
      return false;
    }
    if (!uploadData.url) {
      setError('Upload did not return an image URL');
      return false;
    }
    const res = await fetch('/api/user/me', {
      body: JSON.stringify({ imageUrl: uploadData.url }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    const data = (await res.json()) as { error?: string } & PublicUser;
    if (!res.ok) {
      setError(data.error ?? 'Could not save photo URL');
      return false;
    }
    setUser((u) => ({ ...u, imageUrl: data.imageUrl }));
    setMessage('Profile photo updated');
    router.refresh();
    return true;
  }

  function onAvatarFileChosen(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setMessage(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be 8MB or smaller');
      return;
    }
    if (cropObjectUrl) {
      URL.revokeObjectURL(cropObjectUrl);
    }
    const url = URL.createObjectURL(file);
    setCropObjectUrl(url);
    setCropOpen(true);
  }

  async function onCropComplete(blob: Blob): Promise<void> {
    setSaving(true);
    try {
      const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
      const ok = await uploadAvatarFile(file);
      if (ok) {
        endCrop();
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function removeAvatar() {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/user/me', {
        body: JSON.stringify({ imageUrl: null }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const data = (await res.json()) as { error?: string } & PublicUser;
      if (!res.ok) {
        setError(data.error ?? 'Could not remove photo');
        return;
      }
      setUser((u) => ({ ...u, imageUrl: null }));
      setMessage('Profile photo removed');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        body: JSON.stringify({ currentPassword, newPassword }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not change password');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Password updated');
    } catch {
      setError('Network error');
    } finally {
      setPwLoading(false);
    }
  }

  async function startTfaSetup() {
    setError(null);
    setMessage(null);
    setTfaBusy(true);
    try {
      const res = await fetch('/api/user/tfa/setup', { method: 'POST' });
      const data = (await res.json()) as { error?: string; qrDataUrl?: string; secret?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not start 2FA setup');
        return;
      }
      setTfaQr(data.qrDataUrl ?? null);
      setTfaSecret(data.secret ?? null);
      setTfaSetupOtp('');
    } catch {
      setError('Network error');
    } finally {
      setTfaBusy(false);
    }
  }

  async function confirmTfaSetup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setTfaBusy(true);
    try {
      const res = await fetch('/api/user/tfa/verify-setup', {
        body: JSON.stringify({ otp: tfaSetupOtp }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = (await res.json()) as { error?: string; tfaEnabled?: boolean };
      if (!res.ok) {
        setError(data.error ?? 'Invalid code');
        return;
      }
      setUser((u) => ({ ...u, tfaEnabled: true }));
      setTfaQr(null);
      setTfaSecret(null);
      setTfaSetupOtp('');
      setMessage('Two-factor authentication is on');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setTfaBusy(false);
    }
  }

  async function disableTfa(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setTfaBusy(true);
    try {
      const res = await fetch('/api/user/tfa/disable', {
        body: JSON.stringify({ otp: disableOtp, password: disablePassword }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not disable 2FA');
        return;
      }
      setUser((u) => ({ ...u, tfaEnabled: false }));
      setDisablePassword('');
      setDisableOtp('');
      setMessage('Two-factor authentication is off');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setTfaBusy(false);
    }
  }

  async function deleteAccount(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDeleteBusy(true);
    try {
      const res = await fetch('/api/user/me', {
        body: JSON.stringify({ password: deletePassword }),
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not delete account');
        return;
      }
      window.location.assign('/');
    } catch {
      setError('Network error');
    } finally {
      setDeleteBusy(false);
    }
  }

  const avatarSrc = user.imageUrl;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your details, security, and account.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
          <CardDescription>
            Choose a picture, then crop and zoom in the editor. Photos are stored on Cloudinary; removing a photo
            deletes it from Cloudinary. PNG, JPEG, or WebP, up to 8MB for the original file.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="shrink-0">
            {avatarSrc ? (
              <button
                className="relative size-24 cursor-zoom-in overflow-hidden rounded-full border border-border bg-muted ring-offset-2 transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setPhotoPreviewOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPhotoPreviewOpen(true);
                  }
                }}
                type="button"
              >
                <span className="sr-only">View profile photo</span>
                {/* eslint-disable-next-line @next/next/no-img-element -- user avatar URL (Cloudinary) */}
                <img alt="" className="size-full object-cover" height={96} src={avatarSrc} width={96} />
              </button>
            ) : (
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-2xl font-semibold text-muted-foreground">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild disabled={saving || cropOpen} variant="outline">
              <label className="cursor-pointer">
                Change photo
                <input
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={onAvatarFileChosen}
                  type="file"
                />
              </label>
            </Button>
            {avatarSrc ? (
              <Button disabled={saving} onClick={removeAvatar} type="button" variant="ghost">
                Remove photo
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <AvatarCropDialog imageSrc={cropObjectUrl} onCancel={endCrop} onComplete={onCropComplete} open={cropOpen} />

      <Dialog onOpenChange={setPhotoPreviewOpen} open={photoPreviewOpen}>
        <DialogContent className="!max-w-2xl">
          <DialogTitle className="sr-only">Profile photo preview</DialogTitle>
          {avatarSrc ? (
            <div className="flex max-h-[min(85dvh,720px)] items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview full-size user photo */}
              <img alt="" className="max-h-full w-auto max-w-full object-contain" src={avatarSrc} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Your name and bio are shown only in this authenticated profile area.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={saveProfile}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input disabled id="email" readOnly value={user.email} />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" onChange={(e) => setName(e.target.value)} required value={name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" onChange={(e) => setBio(e.target.value)} rows={4} value={bio} />
            </div>
            <Button disabled={saving} type="submit">
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Use a strong password you do not reuse elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={changePassword}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <PasswordInput
                autoComplete="current-password"
                className="space-y-0"
                id="currentPassword"
                inputClassName="h-10"
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                value={currentPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <PasswordInput
                autoComplete="new-password"
                className="space-y-0"
                id="newPassword"
                inputClassName="h-10"
                minLength={8}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                value={newPassword}
              />
            </div>
            <Button disabled={pwLoading} type="submit" variant="secondary">
              {pwLoading ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication (TOTP)</CardTitle>
          <CardDescription>Use an authenticator app such as Google Authenticator or 1Password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm">
            Status: <span className="font-medium">{user.tfaEnabled ? 'Enabled' : 'Disabled'}</span>
          </p>

          {!user.tfaEnabled ? (
            <div className="space-y-4">
              {!tfaQr ? (
                <Button disabled={tfaBusy} onClick={startTfaSetup} type="button">
                  {tfaBusy ? 'Preparing…' : 'Set up authenticator'}
                </Button>
              ) : (
                <form className="space-y-4" onSubmit={confirmTfaSetup}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Scan this QR code with your authenticator app"
                    className="mx-auto max-w-[200px]"
                    src={tfaQr}
                  />
                  {tfaSecret ? (
                    <p className="break-all text-center text-xs text-muted-foreground">
                      Manual key: <span className="font-mono">{tfaSecret}</span>
                    </p>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="tfaSetupOtp">Code from app</Label>
                    <Input
                      autoComplete="one-time-code"
                      id="tfaSetupOtp"
                      onChange={(e) => setTfaSetupOtp(e.target.value)}
                      required
                      value={tfaSetupOtp}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={tfaBusy} type="submit">
                      {tfaBusy ? 'Verifying…' : 'Enable 2FA'}
                    </Button>
                    <Button
                      disabled={tfaBusy}
                      onClick={() => {
                        setTfaQr(null);
                        setTfaSecret(null);
                        setTfaSetupOtp('');
                      }}
                      type="button"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={disableTfa}>
              <p className="text-sm text-muted-foreground">Enter your password and a current code to turn 2FA off.</p>
              <div className="space-y-2">
                <Label htmlFor="disablePassword">Password</Label>
                <PasswordInput
                  autoComplete="current-password"
                  className="space-y-0"
                  id="disablePassword"
                  inputClassName="h-10"
                  onChange={(e) => setDisablePassword(e.target.value)}
                  required
                  value={disablePassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disableOtp">Authenticator code</Label>
                <Input
                  autoComplete="one-time-code"
                  id="disableOtp"
                  onChange={(e) => setDisableOtp(e.target.value)}
                  required
                  value={disableOtp}
                />
              </div>
              <Button disabled={tfaBusy} type="submit" variant="destructive">
                {tfaBusy ? 'Working…' : 'Disable 2FA'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Deleting your account removes your profile data from the database.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={deleteAccount}>
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Confirm with password</Label>
              <PasswordInput
                autoComplete="current-password"
                className="space-y-0"
                id="deletePassword"
                inputClassName="h-10"
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                value={deletePassword}
              />
            </div>
            <Button disabled={deleteBusy} type="submit" variant="destructive">
              {deleteBusy ? 'Deleting…' : 'Delete account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />
      <Button asChild variant="outline">
        <Link href="/">← Back to portfolio</Link>
      </Button>
    </div>
  );
}
