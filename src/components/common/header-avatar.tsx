'use client';

import { useSessionMe } from '@/hooks/use-session-me';
import { usePathname } from 'next/navigation';

import { useAuthModal } from '@/components/auth/auth-modal-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeaderAvatarProps = {
  className?: string;
};

export function HeaderAvatar({ className }: HeaderAvatarProps): React.JSX.Element {
  const { me } = useSessionMe();
  const { open } = useAuthModal();
  const pathname = usePathname();

  const afterPath = pathname.startsWith('/') ? pathname : '/';

  if (me) {
    const initial = me.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <Button
        aria-label="Open account menu"
        className={cn(
          'relative h-9 w-9 shrink-0 rounded-full p-0',
          'ring-1 ring-border/50 ring-offset-1 ring-offset-background hover:bg-foreground/5 hover:ring-primary/40',
          'dark:hover:bg-white/10',
          'md:ring-2 md:ring-offset-2',
          className
        )}
        onClick={() => {
          open('account', { fromPath: afterPath });
        }}
        type="button"
        variant="ghost"
      >
        <Avatar className="size-9 max-h-9 max-w-9 border border-border/30">
          {me.imageUrl ? <AvatarImage alt="" className="object-cover" src={me.imageUrl} /> : null}
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initial}</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <Button
      aria-label="Sign in"
      className={cn(
        'h-9 shrink-0 rounded-full border border-border/60 bg-background/80 px-3.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted/80',
        className
      )}
      onClick={() => open('signIn', { fromPath: afterPath })}
      type="button"
      variant="outline"
    >
      Sign in
    </Button>
  );
}
