import Link from "next/link";
import type { General } from "@/types/content";

interface FooterProps {
  general: General;
}

export function Footer({ general }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border" style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 50%, transparent)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg text-text-primary">{general.name}</p>
          <p className="text-sm text-text-secondary">© {year} All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
          <Link href={general.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            GitHub
          </Link>
          <Link href={general.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            LinkedIn
          </Link>
          <Link href={general.socials.medium} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            Medium
          </Link>
          <Link href={`mailto:${general.socials.email}`} className="hover:text-accent">
            Email
          </Link>
        </div>
      </div>
    </footer>
  );
}
