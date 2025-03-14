import React from 'react';
import About from "@/components/about";
import Education from "@/components/education/education";
import Experiences from "@/components/experiences/experiences";
import Projects from '@/components/projects/projects';
import Credits from '@/components/credits';
import Navigation from '@/components/navigation';
import {promises as fs} from 'fs';

export default async function Home() {
  // Pull in projects from the GitHub API for the projects section
  const res = await fetch('https://api.github.com/users/T2LIPthedeveloper/repos');
  const projects = await res.json();
  const formattedProjects = projects.map(project => ({
    name: project.name,
    framework: project.language || 'N/A',
    description: project.description || 'No description available.',
    href: project.html_url,
    stars: project.stargazers_count.toString()
  }));

  // Read the translation file
  const file = await fs.readFile(process.cwd() + '/public/translations/en.json', 'utf-8');
  const data = JSON.parse(file);

  // Replace the projects from the translation file with the GitHub API projects
  data.projects = formattedProjects;
  // Save that data to the same file
  await fs.writeFile(process.cwd() + '/public/translations/en.json', JSON.stringify(data, null, 2));

  return (
    <main className="flex min-h-screen flex-col items-center pt-24 px-6 lg:px-24 bg-gradient-to-br from-surface-100 via-surface-200 to-surface-100 no-scrollbar">
      <div className='bg-[linear-gradient(to_right,#28282850_1px,transparent_1px),linear-gradient(to_bottom,#28282850_1px,transparent_1px)] bg-[size:24px_24px] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,transparent_60%,#000_100%)] w-full h-full fixed top-0 left-0'>
      </div>
      <div className="z-10 w-full max-w-5xl font-mono text-sm flex flex-col justify-between no-scrollbar">
      <Navigation />
        <div>
          <About data={data.general}></About>
          <Experiences data={data.experiences}></Experiences>
          <Education data={data.education}></Education>
          <Projects data={data.projects}></Projects>
          <Credits data={data.general}></Credits>
        </div>
      </div>
    </main>
  )
}
