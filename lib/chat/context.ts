import type { Content } from "@/types/content";

export function buildPortfolioContext(content: Content): string {
  const { general, experiences, projects } = content;

  const about = general.about.join("\n");
  const experienceSummary = experiences
    .slice(0, 8)
    .map(
      (item) =>
        `- ${item.title} at ${item.company} (${item.startDate} to ${item.endDate}). Skills: ${item.skills.join(", ")}. ${item.description}`
    )
    .join("\n");

  const projectSummary = projects
    .slice(0, 12)
    .map(
      (item) =>
        `- ${item.name} (${item.framework}): ${item.description}. Tags: ${item.keywords.join(", ")}`
    )
    .join("\n");

  return `You are a concise portfolio assistant for ${general.name}.
Answer questions about Atul's background, work experience, projects, and skills using only the context below.
If asked something outside this context, say you don't have that information.
Keep answers brief and friendly.

Headline: ${general.headline}

About:
${about}

Experience:
${experienceSummary}

Projects:
${projectSummary}
`;
}
