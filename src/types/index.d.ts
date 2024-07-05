import { Icons } from '@/components/ui/icons';

declare global {
  /**
   * Represents a repository on GitHub.
   * @description This type is associated with the GitHub pinned repositories endpoint
   **/
  type GithubRepo = {
    description: string;
    forks: number;
    image: string;
    language: string;
    languageColor: string;
    link: string;
    owner: string;
    repo: string;
    stars: number;
    website: string;
  };

  type MbAwanProjects = {
    description: string;
    name: string;
    repo: string;
    technologies: string[];
    thumbnail: string;
    url: string;
  };

  /**
   * Represents weather data for the selected location.
   * @description This type is associated with the sunrise-sunset API
   **/
  type WeatherForecast = {
    results: {
      astronomical_twilight_begin: string;
      astronomical_twilight_end: string;
      civil_twilight_begin: string;
      civil_twilight_end: string;
      day_length: string;
      nautical_twilight_begin: string;
      nautical_twilight_end: string;
      solar_noon: string;
      sunrise: string;
      sunset: string;
    };
    status: string; // OK
    tzid: string; // Timezone (UTC)
  };

  /**
   * @description Represents duration of work experience.
   **/
  type ExperienceDate = {
    end: string;
    start: string;
  };

  /**
   * @description Represents an item in the work experience section.
   **/
  type ExperienceItem = {
    company: string;
    date: ExperienceDate;
    description: string;
    employmentType: EmploymentType;
    image?: string;
    skills?: string[];
    title: string;
  };

  /**
   * @description Represents an item in the navigation menu.
   **/
  type NavItem = {
    disabled?: boolean;
    external?: boolean;
    href: string;
    icon?: keyof typeof Icons;
    label?: string;
    title: string;
  };
}
