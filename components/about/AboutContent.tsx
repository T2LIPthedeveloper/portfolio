import Image from "next/image";
import Link from "next/link";
import type { Content } from "@/types/content";

interface AboutContentProps {
  content: Pick<Content, "general" | "education" | "volunteering">;
}

export function AboutContent({ content }: AboutContentProps) {
  const { general, education, volunteering } = content;

  return (
    <div className="space-y-8">
      <section className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-text-muted">About</p>
          <h1 className="mt-2 font-display text-4xl text-text-primary md:text-5xl">{general.name}</h1>
          <p className="mt-2 text-lg text-text-secondary md:text-xl">{general.headline}</p>
          <div className="mt-4 space-y-2.5 text-base leading-relaxed text-text-secondary md:text-lg">
            {general.about.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`mailto:${general.socials.email}`}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-5 py-2.5 text-base transition-colors hover:bg-surface-muted"
            >
              Email
            </Link>
            <Link
              href="/resumes/Atul Parida.pdf"
              target="_blank"
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 py-2.5 text-base text-white"
            >
              Download CV
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border border-border lg:mx-0 lg:max-w-none">
          <Image
            src="/images/atul.jpg"
            alt={general.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-text-muted">Background</p>
          <h2 className="mt-2 font-display text-2xl text-text-primary md:text-3xl">Education</h2>
          <div className="mt-4 space-y-4">
            {education.map((item) => (
              <article key={item.university} className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="text-lg font-medium text-text-primary">{item.degree}</h3>
                <p className="mt-0.5 text-sm text-text-muted">{item.subject}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-accent hover:underline"
                >
                  {item.university}
                </a>
                <p className="mt-2 font-mono text-xs uppercase tracking-wider text-text-muted">
                  {item.startDate} — {item.endDate}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {volunteering.length > 0 && (
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-text-muted">Community</p>
            <h2 className="mt-2 font-display text-2xl text-text-primary md:text-3xl">Volunteering</h2>
            <div className="mt-4 space-y-4">
              {volunteering.map((item, index) => (
                <article
                  key={`${item.organisation}-${item.position}-${item.startDate}-${index}`}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <h3 className="text-lg font-medium text-text-primary">{item.position}</h3>
                  <p className="mt-0.5 text-sm text-accent">{item.organisation}</p>
                  {item.event && <p className="mt-0.5 text-sm text-text-muted">{item.event}</p>}
                  <p className="mt-2 font-mono text-xs uppercase tracking-wider text-text-muted">
                    {item.startDate} — {item.endDate}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
