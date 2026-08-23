"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  /** When true, content is still being typed out */
  typing?: boolean;
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 text-text-muted" aria-live="polite" aria-label="Thinking">
      <span className="text-sm">Thinking</span>
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:300ms]" />
      </span>
    </div>
  );
}

function TypingMessage({
  fullText,
  onDone,
}: {
  fullText: string;
  onDone: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setDisplayed("");
    let index = 0;
    const charsPerTick = fullText.length > 280 ? 3 : fullText.length > 120 ? 2 : 1;
    const intervalMs = 16;

    const id = window.setInterval(() => {
      index = Math.min(fullText.length, index + charsPerTick);
      setDisplayed(fullText.slice(0, index));
      if (index >= fullText.length) {
        window.clearInterval(id);
        onDoneRef.current();
      }
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [fullText]);

  return (
    <>
      {displayed}
      <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-accent align-middle" aria-hidden />
    </>
  );
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Atul's portfolio assistant. Ask me about his work, projects, or background.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const skipInitialScroll = useRef(true);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-6),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      const reply = data.reply ?? data.error ?? "Something went wrong.";

      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply, typing: true },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Sorry, there was a network error.",
          typing: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[55vh] flex-col rounded-3xl border border-border bg-surface">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5 no-scrollbar md:p-6">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                message.role === "user"
                  ? "bg-accent text-white"
                  : "bg-surface-muted text-text-primary"
              )}
            >
              {message.typing ? (
                <TypingMessage
                  fullText={message.content}
                  onDone={() =>
                    setMessages((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, typing: false } : item
                      )
                    )
                  }
                />
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-surface-muted px-4 py-3">
              <ThinkingIndicator />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 md:p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSend();
            }}
            placeholder="Ask about Atul's work..."
            disabled={loading}
            className="flex-1 rounded-2xl border border-border bg-canvas px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-2"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white disabled:opacity-60"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
