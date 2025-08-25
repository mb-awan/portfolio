import { EmploymentType } from '@/types/enum';

export const experiences: ExperienceItem[] = [
  {
    company: 'Slark Labs - (Startup)',
    date: {
      end: 'August 2025',
      start: 'February 2024',
    },
    description:
      'I worked on SaaS applications UnifyPosts and Wrytify, as well as Webflow extensions and AWS Lambda functions. I also helped set up management tools, led the team, and trained interns while managing their contributions.',
    employmentType: EmploymentType.FullTime,
    image: '/assets/companies/upwork.jpg',
    skills: [
      'SAAS Apps',
      'Team Leading',
      'Next',
      'TypeScript',
      'Express',
      'Redis',
      'BullMQ',
      'MongoDB',
      'Webflow Extension and API',
    ],
    title: 'Software Engineer and Lead Developer',
  },
  {
    company: 'Megaverse Technologies',

    date: {
      end: 'January 2024',
      start: 'August 2023',
    },
    description:
      'Developed a react chrome extension - Seller Dash. A Daraz product hunting tool, was built using React, TypeScript, Express and Postgres and Sql later on. The extension has over 20,000+ users and 4.1 star rating on Chrome Web Store.',
    employmentType: EmploymentType.FullTime,
    image: '/assets/companies/megaverse.png',
    skills: ['React', 'Express', 'Postgress', 'SQL', 'TypeScript', 'Strapi', 'SCSS', 'Chrome Extension'],
    title: 'Associate Software Engineer',
  },
  {
    company: 'Celestial Technologies',
    date: {
      end: 'March 2023',
      start: 'April 2022',
    },
    description:
      'Mainly Worked on Xenon Store and Meta Clout backend, Xenon Store is an e-commerece store while Meta Clout is a social media marketing app to sale and consume different art works. It was built using React, TypeScript, NestJS, and MongoDB.',
    employmentType: EmploymentType.FullTime,
    image: '/assets/companies/celestials.jpg',
    skills: ['NestJS', 'React', 'TypeScript', 'Express', 'MongoDB', 'Postgres'],
    title: 'MERN Stack Developer',
  },
];

export const calculateExperienceDuration = (date: ExperienceDate) => {
  const startDate = new Date(date.start);
  const endDate = date.end === 'Present' ? new Date() : new Date(date.end);
  const months = endDate.getMonth() - startDate.getMonth() + 1 + 12 * (endDate.getFullYear() - startDate.getFullYear());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return years > 0
    ? `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
    : `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
};
