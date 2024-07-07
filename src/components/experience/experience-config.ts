import { EmploymentType } from '@/types/enum';

export const experiences: ExperienceItem[] = [
  {
    company: 'Upwork',
    date: {
      end: 'Present',
      start: 'Mar 2024',
    },
    description:
      "I'm a freelance software engineer, working on various projects for clients around the world. I specialize in building web applications using React, Next.js, and Tailwind CSS.",
    employmentType: EmploymentType.FullTime,
    image: '/assets/companies/upwork.jpg',
    skills: [
      'React',
      'TypeScript',
      'Express',
      'MySQL',
      'MongoDB',
      'Webflow Extension and API',
      'Shopware Theme Development',
    ],
    title: 'Software Engineer (Freelance)',
  },
  {
    company: 'Megaverse Technologies',

    date: {
      end: 'Present',
      start: 'August 2023',
    },
    description:
      'Developed a react chrome extension - Seller Dash. A Daraz product hunting tool, was built using React, TypeScript, Express and Postgres and Sql later on. The extension has over 10,000+ users and 4.5 star rating on Chrome Web Store.',
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
    image: '/assets/companies/celestials.jfif',
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
