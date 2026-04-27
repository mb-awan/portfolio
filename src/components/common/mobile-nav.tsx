'use client';

import { useCallback, useState } from 'react';

import { Menu } from 'lucide-react';
import Link, { type LinkProps } from 'next/link';

import { SocialHeaderLinks } from '@/components/common/social-header-links';
import { Button } from '@/components/ui/button';
import { MobileModeToggleButton } from '@/components/ui/mode-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { mainNav } from '@/config/mainNav';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          className="flex size-9 shrink-0 items-center justify-center p-0 hover:bg-foreground/5 md:hidden dark:hover:bg-white/10"
          type="button"
          variant="ghost"
        >
          <Menu className="size-5 stroke-[2]" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[min(100vw,20rem)] pr-0" side="right">
        <div className="flex h-full flex-col gap-4 overflow-y-auto px-2 py-4">
          <MobileLink className="w-fit" href="/" onOpenChange={setOpen}>
            <span className="font-heading text-lg font-bold">{siteConfig.siteTitle}</span>
          </MobileLink>
          <nav aria-label="Page sections" className="flex flex-col gap-1 border-b border-border pb-3">
            {mainNav.map((item) => (
              <MobileLink
                className="border-b border-border/40 py-2"
                href={item.href}
                key={item.href}
                onOpenChange={setOpen}
              >
                {item.title}
              </MobileLink>
            ))}
          </nav>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Social</p>
            <SocialHeaderLinks className="justify-start gap-1" />
          </div>
          <MobileModeToggleButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}

type MobileLinkProps = {
  children: React.ReactNode;
  className?: string;
  onOpenChange: (open: boolean) => void;
} & LinkProps;

function MobileLink({ children, className, href, onOpenChange }: MobileLinkProps) {
  const handleLinkClick = useCallback(() => onOpenChange(false), [onOpenChange]);
  return (
    <Link className={cn('transition-colors hover:text-foreground/80', className)} href={href} onClick={handleLinkClick}>
      {children}
    </Link>
  );
}
