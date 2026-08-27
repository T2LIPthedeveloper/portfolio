import { PageShell } from "@/components/layout/PageShell";
import { WorkExperienceView } from "@/components/work/WorkExperienceView";
import { getContent } from "@/lib/content";

export const metadata = {
  title: "Work | Atul Parida",
  description: "Atul Parida's professional experience across software engineering and data science.",
};

export default async function WorkPage() {
  const content = await getContent();

  return (
    <PageShell className="flex h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-h-[100dvh] flex-col overflow-hidden pb-3 sm:pb-4">
      <WorkExperienceView experiences={content.experiences} />
    </PageShell>
  );
}
