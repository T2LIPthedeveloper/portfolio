import Link from "next/link";
import type { Experience, Project } from "@/types/content";

interface TeaserSectionProps {
  experiences: Experience[];
  projects: Project[];
}

export function TeaserSection({ experiences, projects }: TeaserSectionProps) {
  const featuredExperience = experiences[0];
  const featuredProjects = projects.slice(0, 3);

  return (
    <section className="grid gap-4 py-4 md:grid-cols-2 md:items-stretch md:py-6">
      <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">Current role</p>
        {featuredExperience && (
          <>
            <h2 className="mt-1.5 font-display text-2xl text-text-primary md:text-3xl">
              {featuredExperience.title}
            </h2>
            <p className="mt-1 text-base text-accent">{featuredExperience.company}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-text-muted">
              {featuredExperience.startDate} — {featuredExperience.endDate}
            </p>
            <p className="mt-3 flex-1 text-base leading-relaxed text-text-secondary">
              {featuredExperience.description}
            </p>
            <Link
              href="/work"
              className="mt-4 inline-flex min-h-11 items-center text-base font-medium text-accent hover:underline"
            >
              See full work history →
            </Link>
          </>
        )}
      </div>

      <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">Featured projects</p>
        <div className="mt-3 flex-1 space-y-2.5">
          {featuredProjects.map((project) => (
            <a
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block min-h-11 rounded-xl border border-border px-4 py-2.5 transition-colors hover:border-accent/30"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-surface-muted) 45%, transparent)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-base font-medium text-text-primary">{project.name}</h3>
                <span className="shrink-0 font-mono text-xs text-text-muted">{project.framework}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                {project.description}
              </p>
            </a>
          ))}
        </div>
        <Link
          href="/projects"
          className="mt-4 inline-flex min-h-11 items-center text-base font-medium text-accent hover:underline"
        >
          Browse all projects →
        </Link>
      </div>
    </section>
  );
}
