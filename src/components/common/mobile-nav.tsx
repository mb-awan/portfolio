'use client';

import { useCallback, useState } from 'react';

import { Command } from 'lucide-react';
import Link, { LinkProps } from 'next/link';

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
        <Button className="flex w-9 px-0 md:hidden" variant={'ghost'}>
          <Command className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="container pr-0" side="right">
        <div className="container my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <MobileLink className="w-fit" href="/" onOpenChange={setOpen}>
              <span className="font-heading font-bold">{siteConfig.siteTitle}</span>
            </MobileLink>
            {mainNav.map((item) => (
              <MobileLink className="border-b" href={item.href} key={item.href} onOpenChange={setOpen}>
                {item.title}
              </MobileLink>
            ))}
            <MobileModeToggleButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onOpenChange: (open: boolean) => void;
}

function MobileLink({ children, className, href, onOpenChange }: MobileLinkProps) {
  const handleLinkClick = useCallback(() => onOpenChange(false), [onOpenChange]);
  return (
    <Link className={cn(className)} href={href} onClick={handleLinkClick}>
      {children}
    </Link>
  );
}
