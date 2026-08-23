import { PageShell } from "@/components/layout/PageShell";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { getContent } from "@/lib/content";

export const metadata = {
  title: "Chat | Atul Parida",
  description: "Chat with Atul Parida's portfolio assistant.",
};

export default async function ChatPage() {
  const content = await getContent();

  return (
    <>
      <PageShell narrow>
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">Assistant</p>
          <h1 className="mt-2 font-display text-4xl text-text-primary md:text-5xl">Chat</h1>
          <p className="mt-2 text-text-secondary">
            Ask about Atul&apos;s experience, projects, and background.
          </p>
        </div>
        <ChatWidget />
      </PageShell>
      <Footer general={content.general} />
    </>
  );
}
