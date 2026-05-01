'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight, ImageIcon, Loader2, Search } from 'lucide-react';

import { AdminUserDetailDialog } from '@/app/admin/users/admin-user-detail-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type AdminUserRow = {
  addressSummary: string;
  bio: string;
  createdAt?: string;
  email: string;
  emailVerified: boolean;
  gender: string;
  id: string;
  imageUrl: null | string;
  name: string;
  phone: string;
  profileCompletionPercent: number;
  role: { id: string; name?: string; slug?: string } | null;
};

type RoleOption = { description: string; id: string; name: string; slug: string };

type AdminUsersClientProps = {
  canAssignRole: boolean;
  canEdit: boolean;
};

export function AdminUsersClient({ canAssignRole, canEdit }: AdminUsersClientProps): React.JSX.Element {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [savingId, setSavingId] = useState<null | string>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<null | string>(null);
  const [previewUrl, setPreviewUrl] = useState<null | string>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ]);

  const loadRoles = useCallback(async () => {
    if (!canAssignRole) {
      return;
    }
    const res = await fetch('/api/admin/roles');
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { roles: RoleOption[] };
    setRoles(data.roles ?? []);
  }, [canAssignRole]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
        q: debouncedQ,
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = (await res.json()) as { error?: string; total?: number; users?: AdminUserRow[] };
      if (!res.ok) {
        setError(data.error ?? 'Could not load users');
        setUsers([]);
        setTotal(0);
        return;
      }
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError('Network error');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, limit, page]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [limit, total]);

  async function patchUser(
    id: string,
    body: { emailVerified?: boolean; name?: string; roleId?: null | string }
  ): Promise<void> {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Save failed');
        return;
      }
      await loadUsers();
    } catch {
      setError('Network error');
    } finally {
      setSavingId(null);
    }
  }

  function openDetails(id: string): void {
    setDetailUserId(id);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search users"
              className="h-11 pl-9"
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone, city, country…"
              value={q}
            />
          </div>
          <p className="text-sm tabular-nums text-muted-foreground">
            {total} user{total === 1 ? '' : 's'}
          </p>
        </CardContent>
      </Card>

      {error ? (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
        <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/50">
              <th className="w-14 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Photo</th>
              <th className="min-w-[200px] p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                User
              </th>
              <th className="min-w-[108px] p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Phone
              </th>
              <th className="min-w-[140px] p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Location
              </th>
              <th className="min-w-[100px] p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Profile
              </th>
              <th className="w-16 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gender</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verified</th>
              <th className="min-w-[120px] p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </th>
              <th className="whitespace-nowrap p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Joined
              </th>
              <th className="w-[104px] p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-10 text-center text-muted-foreground" colSpan={10}>
                  <span className="inline-flex items-center gap-2">
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                    Loading…
                  </span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-muted-foreground" colSpan={10}>
                  No users match this search.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const initial = u.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr
                    className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/25"
                    key={u.id}
                  >
                    <td className="px-3 py-2 align-middle">
                      <button
                        className={cn(
                          'rounded-full ring-offset-2 transition hover:ring-2 hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          u.imageUrl ? 'cursor-zoom-in' : 'cursor-default'
                        )}
                        disabled={!u.imageUrl}
                        onClick={() => u.imageUrl && setPreviewUrl(u.imageUrl)}
                        type="button"
                      >
                        <span className="sr-only">View profile photo</span>
                        <Avatar className="size-10 border border-border/50">
                          {u.imageUrl ? <AvatarImage alt="" className="object-cover" src={u.imageUrl} /> : null}
                          <AvatarFallback className="text-xs font-semibold">{initial}</AvatarFallback>
                        </Avatar>
                      </button>
                    </td>
                    <td className="max-w-[220px] px-3 py-2 align-top">
                      <div className="space-y-1">
                        {canEdit ? (
                          <InlineNameEditor
                            busy={savingId === u.id}
                            initialName={u.name}
                            onSave={(name) => {
                              if (name === u.name) {
                                return;
                              }
                              void patchUser(u.id, { name });
                            }}
                            userId={u.id}
                          />
                        ) : (
                          <span className="font-medium">{u.name}</span>
                        )}
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        {u.bio.trim() ? <p className="line-clamp-2 text-xs text-muted-foreground">{u.bio}</p> : null}
                      </div>
                    </td>
                    <td className="max-w-[130px] truncate px-3 py-2 align-top text-muted-foreground">
                      {u.phone.trim() ? u.phone : '—'}
                    </td>
                    <td className="max-w-[180px] px-3 py-2 align-top text-muted-foreground" title={u.addressSummary}>
                      <span className="line-clamp-2 text-xs leading-snug">
                        {u.addressSummary.trim() ? u.addressSummary : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium tabular-nums">{u.profileCompletionPercent}%</span>
                        <div className="h-1.5 w-full max-w-[88px] overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/80"
                            style={{ width: `${Math.min(100, Math.max(0, u.profileCompletionPercent))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-muted-foreground">{genderShort(u.gender)}</td>
                    <td className="px-3 py-2 align-top">
                      {canEdit ? (
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            checked={u.emailVerified}
                            className="size-4 rounded border-border accent-primary"
                            disabled={savingId === u.id}
                            onChange={(e) => {
                              void patchUser(u.id, { emailVerified: e.target.checked });
                            }}
                            type="checkbox"
                          />
                          <span className="sr-only">Email verified</span>
                        </label>
                      ) : u.emailVerified ? (
                        <Badge variant="secondary">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {canAssignRole ? (
                        <select
                          className={cn(
                            'h-9 max-w-[160px] rounded-md border border-input bg-background px-2 text-xs',
                            savingId === u.id && 'opacity-60'
                          )}
                          disabled={savingId === u.id}
                          onChange={(e) => {
                            const value = e.target.value;
                            const roleId = value === '' ? null : value;
                            const currentId = u.role?.id ?? '';
                            const next = roleId ?? '';
                            if (next === currentId) {
                              return;
                            }
                            void patchUser(u.id, { roleId: roleId === null ? null : roleId });
                          }}
                          value={u.role?.id ?? ''}
                        >
                          <option value="">No role</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.slug})
                            </option>
                          ))}
                        </select>
                      ) : u.role?.slug ? (
                        <Badge variant="outline">{u.role.slug}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 align-top text-xs text-muted-foreground">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Button
                        className="h-8 gap-1.5 px-3 text-xs font-medium shadow-none"
                        onClick={() => openDetails(u.id)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <ImageIcon aria-hidden className="size-3.5 opacity-70" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <Button
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            size="sm"
            type="button"
            variant="outline"
          >
            <ChevronLeft aria-hidden className="size-4" />
            Previous
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            Next
            <ChevronRight aria-hidden className="size-4" />
          </Button>
        </div>
      ) : null}

      <AdminUserDetailDialog
        onOpenChange={(o) => {
          setDetailOpen(o);
          if (!o) {
            setDetailUserId(null);
          }
        }}
        open={detailOpen}
        userId={detailUserId}
      />

      <Dialog
        onOpenChange={(o) => {
          if (!o) {
            setPreviewUrl(null);
          }
        }}
        open={previewUrl !== null}
      >
        <DialogContent className="!max-w-3xl">
          <DialogTitle className="sr-only">Profile photo</DialogTitle>
          {previewUrl ? (
            <div className="flex max-h-[min(85dvh,720px)] items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="max-h-full w-auto max-w-full object-contain" src={previewUrl} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function genderShort(g: string): string {
  switch (g) {
    case 'female':
      return 'F';
    case 'male':
      return 'M';
    case 'non_binary':
      return 'NB';
    case 'other':
      return 'O';
    case 'prefer_not_say':
      return '—';
    default:
      return '—';
  }
}

function InlineNameEditor({
  busy,
  initialName,
  onSave,
  userId,
}: {
  busy: boolean;
  initialName: string;
  onSave: (name: string) => void;
  userId: string;
}): React.JSX.Element {
  const [value, setValue] = useState(initialName);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setValue(initialName);
  }, [initialName]);

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <Label className="sr-only" htmlFor={`user-name-${userId}`}>
          Name
        </Label>
        <div className="flex flex-wrap items-center gap-1">
          <Input
            className="h-8 max-w-[200px] text-sm"
            disabled={busy}
            id={`user-name-${userId}`}
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
          <Button
            className="h-8"
            disabled={busy || value.trim().length === 0}
            onClick={() => {
              onSave(value.trim());
              setEditing(false);
            }}
            size="sm"
            type="button"
          >
            Save
          </Button>
          <Button
            className="h-8"
            disabled={busy}
            onClick={() => {
              setValue(initialName);
              setEditing(false);
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      className="text-left font-medium hover:underline"
      disabled={busy}
      onClick={() => setEditing(true)}
      type="button"
    >
      {initialName}
    </button>
  );
}
