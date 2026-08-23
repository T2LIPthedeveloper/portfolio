"use client";

import type { Experience } from "@/types/content";
import { ThemeLogo } from "@/components/ui/ThemeLogo";
import { FocusCarousel } from "@/components/ui/FocusCarousel";
import { cn } from "@/lib/utils";

interface ExperienceTimelineProps {
  experiences: Experience[];
}

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  return (
    <FocusCarousel
      items={experiences}
      getKey={(experience) => `${experience.company}-${experience.startDate}`}
      renderItem={(experience, _index, isFocused) => (
        <article
          className={cn(
            "rounded-2xl border border-border bg-surface",
            isFocused ? "p-4 shadow-md md:p-5" : "p-3"
          )}
        >
          <div
            className={cn(
              "flex gap-2.5",
              isFocused ? "flex-col md:flex-row md:items-start md:gap-3" : "items-center"
            )}
          >
            <ThemeLogo
              logo={experience.logo}
              logoLight={experience.logoLight}
              alt={experience.company}
              className={cn("shrink-0", isFocused ? "h-12 w-12" : "h-9 w-9")}
              size={isFocused ? 34 : 24}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2
                    className={cn(
                      "font-display text-text-primary",
                      isFocused ? "text-xl md:text-2xl" : "truncate text-sm font-medium"
                    )}
                  >
                    {experience.title}
                  </h2>
                  <p className={cn("text-accent", isFocused ? "text-sm" : "truncate text-xs")}>
                    {experience.company}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 font-mono uppercase tracking-wider text-text-muted",
                    isFocused ? "text-xs" : "text-[10px]"
                  )}
                >
                  {experience.startDate} — {experience.endDate}
                </p>
              </div>
              {isFocused && (
                <>
                  <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                    {experience.description}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {experience.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </article>
      )}
    />
  );
}
