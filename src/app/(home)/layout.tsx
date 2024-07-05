import { PropsWithChildren } from 'react';

import { SiteFooter } from '@/components/common/site-footer';
import { SiteHeader } from '@/components/common/site-header';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
      <SiteFooter />
    </>
  );
}
