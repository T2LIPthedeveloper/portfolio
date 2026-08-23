import { PageShell } from "@/components/layout/PageShell";
import { Footer } from "@/components/layout/Footer";
import { AboutContent } from "@/components/about/AboutContent";
import { getContent } from "@/lib/content";

export const metadata = {
  title: "About | Atul Parida",
  description: "Learn more about Atul Parida's background, education, and volunteering.",
};

export default async function AboutPage() {
  const content = await getContent();

  return (
    <>
      <PageShell>
        <AboutContent content={content} />
      </PageShell>
      <Footer general={content.general} />
    </>
  );
}
