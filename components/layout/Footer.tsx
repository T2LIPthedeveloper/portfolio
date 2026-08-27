import Link from "next/link";
import type { General } from "@/types/content";

interface FooterProps {
  general: General;
}

export function Footer({ general }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border" style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 50%, transparent)" }}>
      <div
        className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div>
          <p className="font-display text-lg text-text-primary">{general.name}</p>
          <p className="text-sm text-text-secondary">© {year} All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-1 text-sm text-text-secondary sm:gap-2">
          <Link
            href={general.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center px-2 hover:text-accent"
          >
            GitHub
          </Link>
          <Link
            href={general.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center px-2 hover:text-accent"
          >
            LinkedIn
          </Link>
          <Link
            href={general.socials.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center px-2 hover:text-accent"
          >
            Medium
          </Link>
          <Link
            href={`mailto:${general.socials.email}`}
            className="inline-flex min-h-11 items-center px-2 hover:text-accent"
          >
            Email
          </Link>
        </div>
      </div>
    </footer>
  );
}
