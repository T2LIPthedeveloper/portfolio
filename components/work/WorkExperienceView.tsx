"use client";

import type { Experience } from "@/types/content";
import { ExperienceTimeline } from "@/components/work/ExperienceTimeline";

interface WorkExperienceViewProps {
  experiences: Experience[];
}

/** Sticky page intro + independent scrollable timeline (mandatory snap). */
export function WorkExperienceView({ experiences }: WorkExperienceViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted sm:text-xs">Experience</p>
        <h1 className="mt-1 font-display text-3xl text-text-primary sm:mt-1.5 md:text-4xl">Work</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary sm:mt-1.5">
          Roles across fintech, platform engineering, data science, and research.
        </p>
      </header>

      <div className="relative mt-1 min-h-0 flex-1 overflow-hidden">
        <ExperienceTimeline experiences={experiences} />
      </div>
    </div>
  );
}
