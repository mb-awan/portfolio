'use client';

import type {
  BusinessDetails,
  EducationEntry,
  ExperienceEntry,
  Gender,
  PostalAddress,
  SocialLink,
} from '@/types/user-profile';

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';

import { EMPTY_BUSINESS_DETAILS, EMPTY_POSTAL_ADDRESS } from '@/types/user-profile';
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
import { emptyEducationRow, emptyExperienceRow, emptySocialLink } from '@/lib/user/profile-response';
import { SOCIAL_PLATFORM_OPTIONS } from '@/lib/user/social-platforms';

const GENDER_SELECT: { label: string; value: Gender }[] = [
  { label: 'Prefer not to say', value: 'prefer_not_say' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Other', value: 'other' },
];

function filterSocialLinks(list: SocialLink[]): SocialLink[] {
  return list.filter((l) => l.platform.trim().length > 0 && l.url.trim().length > 0);
}

function genderForForm(g: Gender | string | undefined): Gender | string {
  return !g || g === '' ? 'prefer_not_say' : g;
}

function filterEducationEntries(list: EducationEntry[]): EducationEntry[] {
  return list.filter(
    (e) =>
      [e.institution, e.degree, e.field, e.notes].some((s) => s.trim().length > 0) ||
      e.startYear != null ||
      e.endYear != null
  );
}

function filterExperienceEntries(list: ExperienceEntry[]): ExperienceEntry[] {
  return list.filter((e) =>
    [e.title, e.company, e.description, e.location, e.startDate, e.endDate, e.employmentType].some(
      (s) => s.trim().length > 0
    )
  );
}

function hasBusinessContent(b: BusinessDetails): boolean {
  return Object.values(b).some((v) => v.trim().length > 0);
}

type ProfileFormProps = {
  initialUser: PublicUser;
};

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState<PostalAddress>(() => ({ ...EMPTY_POSTAL_ADDRESS, ...user.address }));
  const [gender, setGender] = useState<Gender | string>(() => genderForForm(user.gender));
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() =>
    user.socialLinks?.length ? user.socialLinks : [emptySocialLink()]
  );
  const [education, setEducation] = useState<EducationEntry[]>(() =>
    user.education?.length ? user.education : [emptyEducationRow()]
  );
  const [experience, setExperience] = useState<ExperienceEntry[]>(() =>
    user.experience?.length ? user.experience : [emptyExperienceRow()]
  );
  const [business, setBusiness] = useState<BusinessDetails>(() => ({
    ...EMPTY_BUSINESS_DETAILS,
    ...(user.businessDetails ?? EMPTY_BUSINESS_DETAILS),
  }));
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

  useEffect(() => {
    setUser(initialUser);
    setName(initialUser.name);
    setBio(initialUser.bio);
    setPhone(initialUser.phone);
    setAddress({ ...EMPTY_POSTAL_ADDRESS, ...initialUser.address });
    setGender(genderForForm(initialUser.gender));
    setSocialLinks(initialUser.socialLinks?.length ? initialUser.socialLinks : [emptySocialLink()]);
    setEducation(initialUser.education?.length ? initialUser.education : [emptyEducationRow()]);
    setExperience(initialUser.experience?.length ? initialUser.experience : [emptyExperienceRow()]);
    setBusiness({ ...EMPTY_BUSINESS_DETAILS, ...(initialUser.businessDetails ?? EMPTY_BUSINESS_DETAILS) });
  }, [initialUser]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/user/me', {
        body: JSON.stringify({
          address: {
            city: address.city.trim(),
            country: address.country.trim(),
            district: address.district.trim(),
            province: address.province.trim(),
            zipCode: address.zipCode.trim(),
          },
          bio,
          businessDetails: hasBusinessContent(business) ? business : { ...EMPTY_BUSINESS_DETAILS },
          education: filterEducationEntries(education),
          experience: filterExperienceEntries(experience),
          gender,
          name,
          phone: phone.trim(),
          socialLinks: filterSocialLinks(socialLinks),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const data = (await res.json()) as { error?: string } & PublicUser;
      if (!res.ok) {
        setError(data.error ?? 'Could not save profile');
        return;
      }
      setUser(data);
      setName(data.name);
      setBio(data.bio);
      setPhone(data.phone);
      setAddress({ ...EMPTY_POSTAL_ADDRESS, ...data.address });
      setGender(genderForForm(data.gender));
      setSocialLinks(data.socialLinks?.length ? data.socialLinks : [emptySocialLink()]);
      setEducation(data.education?.length ? data.education : [emptyEducationRow()]);
      setExperience(data.experience?.length ? data.experience : [emptyExperienceRow()]);
      setBusiness({ ...EMPTY_BUSINESS_DETAILS, ...(data.businessDetails ?? EMPTY_BUSINESS_DETAILS) });
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
    setUser(data);
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
      setUser(data);
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

      <Card className="border-primary/20 bg-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Profile completion</CardTitle>
          <CardDescription>
            Fill in the sections below to reach 100%. This score updates when you save your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium tabular-nums">{user.profileCompletionPercent}%</span>
            <span className="text-muted-foreground">Complete</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${Math.min(100, Math.max(0, user.profileCompletionPercent))}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
          <CardDescription>
            Choose a picture, then crop and zoom in the editor. Photos are stored on Cloud Server; removing a photo
            deletes it from our cloud server as well. PNG, JPEG, or WebP, up to 8MB for the original file.
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

      <form className="space-y-8" onSubmit={saveProfile}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Contact, structured address, gender, social links, and bio. Registration requires phone and full address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                autoComplete="tel"
                id="phone"
                inputMode="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                required
                type="tel"
                value={phone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                id="gender"
                onChange={(e) => setGender(e.target.value as Gender)}
                value={gender}
              >
                {GENDER_SELECT.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Address</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="addr-city">City</Label>
                  <Input
                    autoComplete="address-level2"
                    id="addr-city"
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    required
                    value={address.city}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-district">District</Label>
                  <Input
                    id="addr-district"
                    onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))}
                    required
                    value={address.district}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-province">Province / state</Label>
                  <Input
                    autoComplete="address-level1"
                    id="addr-province"
                    onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                    required
                    value={address.province}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-country">Country</Label>
                  <Input
                    autoComplete="country-name"
                    id="addr-country"
                    onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                    required
                    value={address.country}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-zip">ZIP / postal code</Label>
                  <Input
                    autoComplete="postal-code"
                    id="addr-zip"
                    onChange={(e) => setAddress((a) => ({ ...a, zipCode: e.target.value }))}
                    required
                    value={address.zipCode}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Social profiles</p>
                  <p className="text-xs text-muted-foreground">Add links visitors can use to find you.</p>
                </div>
                <Button
                  onClick={() => setSocialLinks((rows) => [...rows, emptySocialLink()])}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Add link
                </Button>
              </div>
              <div className="space-y-3">
                {socialLinks.map((row, idx) => (
                  <div
                    className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-end"
                    key={`soc-${idx}`}
                  >
                    <div className="space-y-2 sm:w-44">
                      <Label htmlFor={`soc-plat-${idx}`}>Platform</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        id={`soc-plat-${idx}`}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSocialLinks((rows) => rows.map((r, i) => (i === idx ? { ...r, platform: v } : r)));
                        }}
                        value={row.platform || 'website'}
                      >
                        {SOCIAL_PLATFORM_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <Label htmlFor={`soc-url-${idx}`}>URL</Label>
                      <Input
                        id={`soc-url-${idx}`}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSocialLinks((rows) => rows.map((r, i) => (i === idx ? { ...r, url: v } : r)));
                        }}
                        placeholder="https://"
                        type="url"
                        value={row.url}
                      />
                    </div>
                    {socialLinks.length > 1 ? (
                      <Button
                        className="sm:mb-0.5"
                        onClick={() => setSocialLinks((rows) => rows.filter((_, i) => i !== idx))}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" onChange={(e) => setBio(e.target.value)} rows={4} value={bio} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Optional — schools, degrees, and notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.map((row, idx) => (
              <div className="space-y-3 rounded-lg border border-border/60 p-4" key={`edu-${idx}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Entry {idx + 1}</span>
                  {education.length > 1 ? (
                    <Button
                      onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`edu-inst-${idx}`}>Institution</Label>
                    <Input
                      id={`edu-inst-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEducation((rows) => rows.map((r, i) => (i === idx ? { ...r, institution: v } : r)));
                      }}
                      value={row.institution}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`edu-degree-${idx}`}>Degree / qualification</Label>
                    <Input
                      id={`edu-degree-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEducation((rows) => rows.map((r, i) => (i === idx ? { ...r, degree: v } : r)));
                      }}
                      value={row.degree}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`edu-field-${idx}`}>Field of study</Label>
                    <Input
                      id={`edu-field-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEducation((rows) => rows.map((r, i) => (i === idx ? { ...r, field: v } : r)));
                      }}
                      value={row.field}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`edu-start-${idx}`}>Start year</Label>
                    <Input
                      id={`edu-start-${idx}`}
                      inputMode="numeric"
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        const y = raw === '' ? undefined : Number.parseInt(raw, 10);
                        setEducation((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, startYear: Number.isFinite(y) ? y : undefined } : r))
                        );
                      }}
                      placeholder="e.g. 2018"
                      value={row.startYear ?? ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`edu-end-${idx}`}>End year</Label>
                    <Input
                      id={`edu-end-${idx}`}
                      inputMode="numeric"
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        const y = raw === '' ? undefined : Number.parseInt(raw, 10);
                        setEducation((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, endYear: Number.isFinite(y) ? y : undefined } : r))
                        );
                      }}
                      placeholder="e.g. 2022"
                      value={row.endYear ?? ''}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`edu-notes-${idx}`}>Notes</Label>
                    <Textarea
                      id={`edu-notes-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEducation((rows) => rows.map((r, i) => (i === idx ? { ...r, notes: v } : r)));
                      }}
                      rows={2}
                      value={row.notes}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              onClick={() => setEducation((rows) => [...rows, emptyEducationRow()])}
              type="button"
              variant="outline"
            >
              Add education
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>Optional — roles and employment history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {experience.map((row, idx) => (
              <div className="space-y-3 rounded-lg border border-border/60 p-4" key={`exp-${idx}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Role {idx + 1}</span>
                  {experience.length > 1 ? (
                    <Button
                      onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`ex-title-${idx}`}>Title</Label>
                    <Input
                      id={`ex-title-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExperience((rows) => rows.map((r, i) => (i === idx ? { ...r, title: v } : r)));
                      }}
                      value={row.title}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`ex-company-${idx}`}>Company</Label>
                    <Input
                      id={`ex-company-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExperience((rows) => rows.map((r, i) => (i === idx ? { ...r, company: v } : r)));
                      }}
                      value={row.company}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`ex-loc-${idx}`}>Location</Label>
                    <Input
                      id={`ex-loc-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExperience((rows) => rows.map((r, i) => (i === idx ? { ...r, location: v } : r)));
                      }}
                      value={row.location}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`ex-type-${idx}`}>Employment type</Label>
                    <Input
                      id={`ex-type-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExperience((rows) => rows.map((r, i) => (i === idx ? { ...r, employmentType: v } : r)));
                      }}
                      placeholder="Full-time, contract…"
                      value={row.employmentType}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`ex-start-${idx}`}>Start</Label>
                    <Input
                      id={`ex-start-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExperience((rows) => rows.map((r, i) => (i === idx ? { ...r, startDate: v } : r)));
                      }}
                      placeholder="Month/year"
                      value={row.startDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`ex-end-${idx}`}>End</Label>
                    <Input
                      id={`ex-end-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExperience((rows) => rows.map((r, i) => (i === idx ? { ...r, endDate: v } : r)));
                      }}
                      placeholder="Present or date"
                      value={row.endDate}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`ex-desc-${idx}`}>Description</Label>
                    <Textarea
                      id={`ex-desc-${idx}`}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExperience((rows) => rows.map((r, i) => (i === idx ? { ...r, description: v } : r)));
                      }}
                      rows={3}
                      value={row.description}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              onClick={() => setExperience((rows) => [...rows, emptyExperienceRow()])}
              type="button"
              variant="outline"
            >
              Add experience
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business & professional</CardTitle>
            <CardDescription>Optional — company or freelance details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="biz-company">Company / brand name</Label>
              <Input
                id="biz-company"
                onChange={(e) => setBusiness((b) => ({ ...b, companyName: e.target.value }))}
                value={business.companyName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-role">Your role</Label>
              <Input
                id="biz-role"
                onChange={(e) => setBusiness((b) => ({ ...b, role: e.target.value }))}
                value={business.role}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-industry">Industry</Label>
              <Input
                id="biz-industry"
                onChange={(e) => setBusiness((b) => ({ ...b, industry: e.target.value }))}
                value={business.industry}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="biz-web">Website</Label>
              <Input
                id="biz-web"
                onChange={(e) => setBusiness((b) => ({ ...b, website: e.target.value }))}
                placeholder="https://"
                type="url"
                value={business.website}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="biz-desc">Description</Label>
              <Textarea
                id="biz-desc"
                onChange={(e) => setBusiness((b) => ({ ...b, description: e.target.value }))}
                rows={3}
                value={business.description}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button disabled={saving} type="submit">
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>

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
