export interface Socials {
  email: string;
  linkedin: string;
  github: string;
  medium: string;
}

export interface General {
  name: string;
  headline: string;
  about: string[];
  socials: Socials;
}

export interface Experience {
  title: string;
  company: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
  logo: string;
  logoLight?: string;
  skills: string[];
}

export interface Education {
  subject: string;
  degree: string;
  university: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Volunteering {
  position: string;
  event: string;
  organisation: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  name: string;
  framework: string;
  description: string;
  href: string;
  stars: string;
  keywords: string[];
}

export interface Content {
  general: General;
  experiences: Experience[];
  education: Education[];
  volunteering: Volunteering[];
  projects: Project[];
}
