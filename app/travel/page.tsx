import { PageShell } from "@/components/layout/PageShell";
import { Footer } from "@/components/layout/Footer";
import { TravelPageContent } from "@/components/travel/TravelPageContent";
import { getContent } from "@/lib/content";
import { getTravelData } from "@/lib/travel";

export const metadata = {
  title: "Travel | Atul Parida",
  description: "Interactive globe of flights and road trips.",
};

export default async function TravelPage() {
  const [content, travelData] = await Promise.all([getContent(), getTravelData()]);

  return (
    <>
      <PageShell>
        <TravelPageContent data={travelData} />
      </PageShell>
      <Footer general={content.general} />
    </>
  );
}
