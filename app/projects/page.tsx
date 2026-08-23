import { PageShell } from "@/components/layout/PageShell";
import { Footer } from "@/components/layout/Footer";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { getContent, getProjectsWithGitHub } from "@/lib/content";

export const metadata = {
  title: "Projects | Atul Parida",
  description: "Selected projects and GitHub repositories by Atul Parida.",
};

export default async function ProjectsPage() {
  const content = await getContent();
  const projects = await getProjectsWithGitHub();

  return (
    <>
      <PageShell>
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">GitHub</p>
          <h1 className="mt-2 font-display text-4xl text-text-primary md:text-5xl">Projects</h1>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Open-source work and experiments pulled live from GitHub.
          </p>
        </div>
        <ProjectsGrid projects={projects.length > 0 ? projects : content.projects} />
      </PageShell>
      <Footer general={content.general} />
    </>
  );
}
