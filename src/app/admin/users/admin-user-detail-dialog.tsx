'use client';

import type { BusinessDetails, EducationEntry, ExperienceEntry, PostalAddress, SocialLink } from '@/types/user-profile';

import { useCallback, useEffect, useState } from 'react';

import { Building2, ExternalLink, GraduationCap, Loader2, MapPin, Phone, Shield, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { socialPlatformLabel } from '@/lib/user/social-platforms';

export type AdminUserFull = {
  address: PostalAddress;
  addressSummary: string;
  bio: string;
  businessDetails: BusinessDetails | null;
  createdAt?: string;
  education: EducationEntry[];
  email: string;
  emailVerified: boolean;
  experience: ExperienceEntry[];
  gender: string;
  id: string;
  imageUrl: null | string;
  name: string;
  phone: string;
  profileCompletionPercent: number;
  role: { description?: string; id: string; name?: string; slug?: string } | null;
  socialLinks: SocialLink[];
  tfaEnabled: boolean;
  updatedAt?: string;
};

function genderLabel(g: string): string {
  const m: Record<string, string> = {
    '': 'Not set',
    female: 'Female',
    male: 'Male',
    non_binary: 'Non-binary',
    other: 'Other',
    prefer_not_say: 'Prefer not to say',
  };
  return m[g] ?? (g.trim() ? g : '—');
}

type AdminUserDetailDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  userId: null | string;
};

export function AdminUserDetailDialog({ onOpenChange, open, userId }: AdminUserDetailDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [detail, setDetail] = useState<AdminUserFull | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = (await res.json()) as { error?: string; user?: AdminUserFull };
      if (!res.ok) {
        setError(data.error ?? 'Could not load user');
        setDetail(null);
        return;
      }
      setDetail(data.user ?? null);
    } catch {
      setError('Network error');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      void load();
    }
  }, [open, userId, load]);

  const initial = detail?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const socialWithUrls = detail?.socialLinks?.filter((l) => l.url.trim().length > 0) ?? [];

  return (
    <>
      <Dialog
        onOpenChange={(o) => {
          if (!o) {
            setPhotoOpen(false);
          }
          onOpenChange(o);
        }}
        open={open}
      >
        <DialogContent className="flex max-h-[min(92dvh,900px)] max-w-3xl flex-col gap-0 overflow-hidden border-border/60 p-0 shadow-xl sm:max-w-3xl">
          <DialogHeader className="border-b border-border/60 bg-gradient-to-r from-primary/[0.06] via-transparent to-transparent px-6 py-5 text-left">
            <DialogTitle className="font-heading text-xl tracking-tight">User profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Read-only view of account data, location, social links, and profile completion.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                <Loader2 aria-hidden className="size-5 animate-spin" />
                Loading…
              </div>
            ) : error ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : detail ? (
              <div className="space-y-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <button
                    className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-full border-2 border-border/80 bg-muted shadow-sm ring-offset-2 transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mx-0"
                    onClick={() => detail.imageUrl && setPhotoOpen(true)}
                    type="button"
                  >
                    {detail.imageUrl ? (
                      <>
                        <span className="sr-only">View profile photo full size</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="size-full object-cover" height={112} src={detail.imageUrl} width={112} />
                      </>
                    ) : (
                      <span className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                        {initial}
                      </span>
                    )}
                  </button>
                  <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
                    <div>
                      <p className="font-heading text-lg font-semibold tracking-tight">{detail.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{detail.email}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                      <Badge variant={detail.emailVerified ? 'secondary' : 'outline'}>
                        Email {detail.emailVerified ? 'verified' : 'not verified'}
                      </Badge>
                      <Badge variant="outline">2FA {detail.tfaEnabled ? 'on' : 'off'}</Badge>
                      {detail.role?.slug ? (
                        <Badge className="font-normal" variant="outline">
                          {detail.role.slug}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <section className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Profile completion</h3>
                    <span className="text-sm font-semibold tabular-nums text-primary">
                      {detail.profileCompletionPercent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${Math.min(100, Math.max(0, detail.profileCompletionPercent))}%` }}
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <User aria-hidden className="size-4 text-muted-foreground" />
                    Contact & identity
                  </h3>
                  <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    <div className="flex gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                      <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <dt className="text-xs text-muted-foreground">Phone</dt>
                        <dd className="font-medium">{detail.phone.trim() ? detail.phone : '—'}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                      <User aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <dt className="text-xs text-muted-foreground">Gender</dt>
                        <dd className="font-medium">{genderLabel(detail.gender)}</dd>
                      </div>
                    </div>
                  </dl>
                </section>

                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin aria-hidden className="size-4 text-muted-foreground" />
                    Address
                  </h3>
                  {detail.addressSummary.trim() ? (
                    <p className="text-xs text-muted-foreground">{detail.addressSummary}</p>
                  ) : null}
                  <dl className="grid gap-2 sm:grid-cols-2">
                    {[
                      ['City', detail.address.city],
                      ['District', detail.address.district],
                      ['Province / state', detail.address.province],
                      ['Country', detail.address.country],
                      ['ZIP / postal', detail.address.zipCode],
                    ].map(([label, value]) =>
                      value.trim() ? (
                        <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2" key={label}>
                          <dt className="text-xs text-muted-foreground">{label}</dt>
                          <dd className="mt-0.5 font-medium">{value}</dd>
                        </div>
                      ) : null
                    )}
                  </dl>
                  {![
                    detail.address.city,
                    detail.address.district,
                    detail.address.province,
                    detail.address.country,
                    detail.address.zipCode,
                  ].some((s) => s.trim()) ? (
                    <p className="text-sm text-muted-foreground">No structured address on file.</p>
                  ) : null}
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">Social profiles</h3>
                  {socialWithUrls.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No social links added.</p>
                  ) : (
                    <ul className="space-y-2">
                      {socialWithUrls.map((l, i) => (
                        <li
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm"
                          key={`${l.platform}-${i}`}
                        >
                          <span className="font-medium text-foreground">{socialPlatformLabel(l.platform)}</span>
                          <a
                            className="inline-flex max-w-[min(100%,280px)] items-center gap-1 truncate text-primary hover:underline"
                            href={l.url.startsWith('http') ? l.url : `https://${l.url}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <span className="truncate">{l.url}</span>
                            <ExternalLink aria-hidden className="size-3.5 shrink-0 opacity-70" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Bio</h3>
                  <p className="whitespace-pre-wrap rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm leading-relaxed">
                    {detail.bio.trim() ? detail.bio : '—'}
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Shield aria-hidden className="size-4 text-muted-foreground" />
                    Role
                  </h3>
                  {detail.role ? (
                    <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm">
                      <p className="font-medium">{detail.role.name ?? detail.role.slug}</p>
                      {detail.role.description ? (
                        <p className="mt-1 text-muted-foreground">{detail.role.description}</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No role assigned.</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <GraduationCap aria-hidden className="size-4 text-muted-foreground" />
                    Education
                  </h3>
                  {detail.education.filter((e) => e.institution.trim() || e.degree.trim()).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entries.</p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.education
                        .filter((e) => e.institution.trim() || e.degree.trim())
                        .map((e, i) => (
                          <li
                            className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm"
                            key={`ed-${i}`}
                          >
                            <p className="font-medium">{e.institution || '—'}</p>
                            <p className="text-muted-foreground">
                              {[e.degree, e.field].filter(Boolean).join(' · ') || '—'}
                            </p>
                            {(e.startYear || e.endYear) && (
                              <p className="text-xs text-muted-foreground">
                                {e.startYear ?? '?'} — {e.endYear ?? '?'}
                              </p>
                            )}
                            {e.notes.trim() ? <p className="mt-1 text-muted-foreground">{e.notes}</p> : null}
                          </li>
                        ))}
                    </ul>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Experience</h3>
                  {detail.experience.filter((x) => x.title.trim() || x.company.trim()).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entries.</p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.experience
                        .filter((e) => e.title.trim() || e.company.trim())
                        .map((e, i) => (
                          <li
                            className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-sm"
                            key={`ex-${i}`}
                          >
                            <p className="font-medium">{e.title || '—'}</p>
                            <p className="text-muted-foreground">{e.company || '—'}</p>
                            <p className="text-xs text-muted-foreground">
                              {[e.startDate, e.endDate].filter(Boolean).join(' → ') || '—'}
                              {e.location?.trim() ? ` · ${e.location}` : ''}
                            </p>
                            {e.description.trim() ? (
                              <p className="mt-1 text-muted-foreground">{e.description}</p>
                            ) : null}
                          </li>
                        ))}
                    </ul>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 aria-hidden className="size-4 text-muted-foreground" />
                    Business / professional
                  </h3>
                  {detail.businessDetails ? (
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      {(
                        [
                          ['Company', detail.businessDetails.companyName],
                          ['Role', detail.businessDetails.role],
                          ['Industry', detail.businessDetails.industry],
                          ['Website', detail.businessDetails.website],
                        ] as const
                      ).map(([label, value]) =>
                        value.trim() ? (
                          <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2" key={label}>
                            <dt className="text-xs text-muted-foreground">{label}</dt>
                            <dd className="break-all font-medium">{value}</dd>
                          </div>
                        ) : null
                      )}
                      {detail.businessDetails.description.trim() ? (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Description</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                            {detail.businessDetails.description}
                          </p>
                        </div>
                      ) : null}
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">No business details.</p>
                  )}
                </section>

                <Separator />

                <section className="space-y-1 text-xs text-muted-foreground">
                  <p>User id: {detail.id}</p>
                  {detail.createdAt ? <p>Joined: {new Date(detail.createdAt).toLocaleString()}</p> : null}
                  {detail.updatedAt ? <p>Last updated: {new Date(detail.updatedAt).toLocaleString()}</p> : null}
                </section>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No user selected.</p>
            )}
          </div>

          <div className="flex justify-end border-t border-border/60 bg-muted/10 px-6 py-3">
            <Button onClick={() => onOpenChange(false)} type="button" variant="secondary">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setPhotoOpen} open={photoOpen}>
        <DialogContent className="!max-w-3xl">
          <DialogTitle className="sr-only">Profile photo</DialogTitle>
          {detail?.imageUrl ? (
            <div className="flex max-h-[min(85dvh,720px)] items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="max-h-full w-auto max-w-full object-contain" src={detail.imageUrl} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
