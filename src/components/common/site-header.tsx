import { HeaderAvatar } from '@/components/common/header-avatar';
import { MainNav } from '@/components/common/main-nav';
import { MobileNav } from '@/components/common/mobile-nav';
import { SocialHeaderLinks } from '@/components/common/social-header-links';
import { ModeToggleButton } from '@/components/ui/mode-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center gap-1 sm:gap-2">
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-0.5 sm:gap-2">
          <MainNav />
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-2">
          <SocialHeaderLinks className="hidden shrink-0 md:flex" />
          <ModeToggleButton className="hidden md:inline-flex" />
          <MobileNav />
          <HeaderAvatar className="shrink-0" />
        </div>
      </div>
    </header>
  );
}
