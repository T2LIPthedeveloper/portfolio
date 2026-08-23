import OpenAI from "openai";
import { getContent } from "@/lib/content";
import { buildPortfolioContext } from "@/lib/chat/context";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { message?: string; history?: Array<{ role: "user" | "assistant"; content: string }> };
  const message = body.message?.trim();

  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const content = await getContent();
  const systemPrompt = buildPortfolioContext(content);
  const model = process.env.OPENAI_MODEL ?? "gpt-5.6-luna";

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const history = (body.history ?? []).slice(-6);

  try {
    const completion = await client.chat.completions.create({
      model,
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";

    return Response.json({ reply });
  } catch (error) {
    console.error("OpenAI chat error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate a response.";
    return Response.json({ error: message }, { status: 500 });
  }
}
