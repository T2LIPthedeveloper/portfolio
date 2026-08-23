import { promises as fs } from "fs";
import path from "path";
import type { Content, Project } from "@/types/content";

const CONTENT_PATH = path.join(process.cwd(), "public/translations/en.json");
const GITHUB_USERNAME = "T2LIPthedeveloper";

export async function getContent(): Promise<Content> {
  const file = await fs.readFile(CONTENT_PATH, "utf-8");
  return JSON.parse(file) as Content;
}

interface GitHubRepo {
  name: string;
  language: string | null;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  topics: string[];
}

export async function getProjectsWithGitHub(): Promise<Project[]> {
  const content = await getContent();

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return content.projects;
    }

    const repos = (await res.json()) as GitHubRepo[];

    return repos.map((repo) => ({
      name: repo.name,
      framework: repo.language ?? "N/A",
      description: repo.description ?? "No description available.",
      href: repo.html_url,
      stars: repo.stargazers_count.toString(),
      keywords: repo.topics.length > 0 ? repo.topics : ["N/A"],
    }));
  } catch {
    return content.projects;
  }
}
