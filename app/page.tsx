import { PageShell } from "@/components/layout/PageShell";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { HeroSection } from "@/components/sections/HeroSection";
import { TeaserSection } from "@/components/sections/TeaserSection";
import { getContent, getProjectsWithGitHub } from "@/lib/content";

export default async function HomePage() {
  const content = await getContent();
  const projects = await getProjectsWithGitHub();

  return (
    <PageTransition>
      <PageShell>
        <HeroSection name={content.general.name} headline={content.general.headline} />
        <TeaserSection experiences={content.experiences} projects={projects} />
      </PageShell>
      <Footer general={content.general} />
    </PageTransition>
  );
}
