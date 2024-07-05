import type { Metadata } from 'next';

import { PropsWithChildren } from 'react';

import { Raleway } from 'next/font/google';

import { ThemeProvider } from '@/components/common/providers';
import { siteConfig } from '@/config/site';

import '@/styles/globals.css';

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--heading-font',
});

export const metadata: Metadata = {
  authors: [{ name: 'Muhammad Bilal', url: siteConfig.links.linkedin }],
  creator: 'Muhammad Bilal',
  description: siteConfig.description,
  icons: {
    apple: '/favicons/apple-touch-icon.png',
    icon: '/favicons/favicon.ico',
    shortcut: '/favicons/favicon-16x16.png',
  },
  keywords: siteConfig.keywords,
  manifest: `/site.webmanifest`,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    description: siteConfig.description,
    images: [
      {
        alt: siteConfig.name,
        height: 630,
        url: siteConfig.opImage,
        width: 1200,
      },
    ],
    locale: 'en_US',
    siteName: siteConfig.name,
    title: siteConfig.name,
    type: 'website',
    url: siteConfig.url,
  },
  title: {
    default: 'Muhammad Bilal - Software Engineer',
    template: `%s | ${siteConfig.name}`,
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@edwinhern15',
    description: siteConfig.description,
    images: [siteConfig.opImage],
    title: siteConfig.name,
  },
};

const RootLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={raleway.variable}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <div className="relative flex min-h-screen flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
