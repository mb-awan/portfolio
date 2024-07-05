export const siteConfig = {
  assets: {
    avatar: '/assets/images/avatar.png',
    discordGif: '/assets/gifs/discord.gif',
    logo: '/assets/images/logo.png',
    resume: '/assets/resume/muhammad-bilal-2024.pdf',
  },
  description: 'Software Engineer, cricket player based in Lahore, Pakistan.',
  keywords: [
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Vitest',
    'React Testing Library',
    'Framer Motion',
    'shadcn/ui',
    'Aceternity UI',
  ],
  links: {
    github: 'https://github.com/mb-awan',
    githubRepo: 'https://github.com/Muhammad-Bilal-official/portfolio1',
    githubRepositories: 'https://github.com/mb-awan?tab=repositories',
    linkedin: 'https://www.linkedin.com/in/muhammad-bilal-4299291b2/',
  },
  name: 'Muhammad Bilal',
  opImage: '/og-image.png',
  siteTitle: 'Muhammad Bilal',
  url: new URL('https://www.muhammad-bilal.top/'),
};

export type SiteConfig = typeof siteConfig;
