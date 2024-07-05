import Link from 'next/link';

import { mainNav } from '@/config/mainNav';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function MainNav() {
  return (
    <div className="flex">
      <Link className="mr-4" href="/">
        <span className="font-heading text-lg font-bold">{siteConfig.siteTitle}</span>
      </Link>
      <nav className="mt-[0.099rem] hidden items-center gap-6 text-sm md:flex">
        {mainNav.map((item) => (
          <Link className={cn('transition-colors hover:text-foreground/80')} href={item.href} key={item.title}>
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
