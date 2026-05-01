'use client';

import { type PropsWithChildren } from 'react';

import { useSessionMe } from '@/hooks/use-session-me';
import { LayoutDashboard, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navClass = (active: boolean): string =>
  cn(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
  );

export function AdminShell({ children }: PropsWithChildren): React.JSX.Element {
  const pathname = usePathname();
  const { me } = useSessionMe();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-border/60 bg-card/95 px-3 py-6 md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Shield aria-hidden className="size-5 text-primary" />
          <span className="font-heading text-sm font-semibold tracking-tight">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          <Link className={navClass(pathname === '/admin')} href="/admin">
            <LayoutDashboard aria-hidden className="size-4 shrink-0" />
            Dashboard
          </Link>
          {me?.permissions?.includes('users.view') ? (
            <Link className={navClass(pathname.startsWith('/admin/users'))} href="/admin/users">
              <Users aria-hidden className="size-4 shrink-0" />
              Users
            </Link>
          ) : null}
        </nav>
        <Separator className="my-4" />
        <div className="mt-auto space-y-2 px-2 text-xs text-muted-foreground">
          <p className="truncate font-medium text-foreground">{me?.name}</p>
          {me?.roleSlug ? (
            <Badge className="font-normal" variant="secondary">
              {me.roleSlug}
            </Badge>
          ) : (
            <span>No role</span>
          )}
          <Button asChild className="h-8 w-full text-xs" size="sm" variant="outline">
            <Link href="/">Back to site</Link>
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="border-b border-border/60 bg-card/80 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield aria-hidden className="size-5 text-primary" />
              <span className="font-heading text-sm font-semibold">Admin</span>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/">Site</Link>
            </Button>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border/40 px-2 pb-2 pt-1">
            <Link className={cn(navClass(pathname === '/admin'), 'shrink-0')} href="/admin">
              <LayoutDashboard aria-hidden className="size-4 shrink-0" />
              Dashboard
            </Link>
            {me?.permissions?.includes('users.view') ? (
              <Link className={cn(navClass(pathname.startsWith('/admin/users')), 'shrink-0')} href="/admin/users">
                <Users aria-hidden className="size-4 shrink-0" />
                Users
              </Link>
            ) : null}
          </nav>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
