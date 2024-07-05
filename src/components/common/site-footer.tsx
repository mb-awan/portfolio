import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-6 md:py-0">
      <div className="container flex max-w-screen-2xl flex-col items-center justify-between md:h-14 md:flex-row">
        <div className="text-balance text-center text-sm leading-loose text-muted md:text-left">
          Built by{' '}
          <a
            className="font-medium underline underline-offset-4"
            href={siteConfig.links.linkedin}
            rel="noreferrer"
            target="_blank"
          >
            Muhammad Bilal
          </a>
          . courtesy edwinhern.
        </div>
      </div>
    </footer>
  );
}
