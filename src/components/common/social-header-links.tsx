import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

type SocialHeaderLinksProps = {
  className?: string;
};

export function SocialHeaderLinks({ className }: SocialHeaderLinksProps): React.JSX.Element {
  return (
    <div aria-label="Social links" className={cn('flex items-center gap-0.5', className)} role="navigation">
      <Link href={siteConfig.links.github} rel="noreferrer" target="_blank">
        <div className={cn(buttonVariants({ variant: 'ghost' }), 'size-9 touch-manipulation px-0')}>
          <Icons.gitHub className="size-4" />
          <span className="sr-only">GitHub</span>
        </div>
      </Link>
      <Link href={siteConfig.links.linkedin} rel="noreferrer" target="_blank">
        <div className={cn(buttonVariants({ variant: 'ghost' }), 'size-9 touch-manipulation px-0')}>
          <Icons.linkedIn className="size-4 fill-current" />
          <span className="sr-only">LinkedIn</span>
        </div>
      </Link>
      <Link href={siteConfig.links.youtubeChannel} rel="noreferrer" target="_blank">
        <div className={cn(buttonVariants({ variant: 'ghost' }), 'size-9 touch-manipulation px-0')}>
          <Icons.youtube className="size-4" />
          <span className="sr-only">YouTube</span>
        </div>
      </Link>
    </div>
  );
}
