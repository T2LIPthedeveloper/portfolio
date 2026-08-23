"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { Project } from "@/types/content";
import { cn } from "@/lib/utils";

interface ProjectsGridProps {
  projects: Project[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [query, setQuery] = useState("");
  const [framework, setFramework] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const frameworks = useMemo(
    () => [...new Set(projects.map((project) => project.framework))].sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (framework && project.framework !== framework) return false;
      if (!normalized) return true;
      const haystack = [project.name, project.framework, project.description, ...project.keywords]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [projects, query, framework]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text-primary outline-none ring-accent/20 focus:ring-2 sm:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFramework(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              framework === null
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-text-secondary hover:border-accent/40"
            )}
          >
            All
          </button>
          {frameworks.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFramework(item === framework ? null : item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                framework === item
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-text-secondary hover:border-accent/40"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-text-secondary">No projects match your filters.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const isExpanded = expanded === project.name;
            return (
              <li key={project.name}>
                <article
                  className={cn(
                    "group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-all duration-200",
                    isExpanded && "border-accent/40 shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                      {project.framework}
                    </span>
                    <span className="font-mono text-xs text-gold">★ {project.stars}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : project.name)}
                    className="mt-3 text-left"
                  >
                    <h2 className="font-display text-xl text-text-primary transition-colors group-hover:text-accent">
                      {project.name}
                    </h2>
                  </button>

                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed text-text-secondary transition-all",
                      isExpanded ? "line-clamp-none" : "line-clamp-2"
                    )}
                  >
                    {project.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.keywords.slice(0, isExpanded ? project.keywords.length : 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-secondary"
                      >
                        {keyword}
                      </span>
                    ))}
                    {!isExpanded && project.keywords.length > 3 && (
                      <span className="px-1 text-xs text-text-muted">+{project.keywords.length - 3}</span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : project.name)}
                      className="text-xs font-medium text-text-muted transition-colors hover:text-accent"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
