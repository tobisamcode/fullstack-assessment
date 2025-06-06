import { NextResponse } from "next/server";
import consultants from "@/app/data";
import type { Consultant, JobDescription } from "@/app/type";

const STOPWORDS = new Set([
  "of",
  "and",
  "with",
  "the",
  "in",
  "to",
  "for",
  "on",
  "at",
  "by",
  "from",
  "a",
  "an",
  "or",
  "but",
  "nor",
  "so",
  "yet",
]);

function extractKeywords(description: string): string[] {
  return description
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

function matchesDescription(
  jobDescription: JobDescription,
  consultant: Consultant
): boolean {
  const desc = jobDescription.toLowerCase().trim();
  if (!desc) return false;

  const roleWords = consultant.role.toLowerCase().split(/\s+/);
  for (const word of roleWords) {
    if (desc.includes(word)) {
      return true;
    }
  }

  for (const skill of consultant.skills) {
    if (desc.includes(skill.toLowerCase())) {
      return true;
    }
  }

  const bio = consultant.bio.toLowerCase();
  const keywords = extractKeywords(jobDescription);
  for (const kw of keywords) {
    if (bio.includes(kw)) {
      return true;
    }
  }

  return false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawDesc = (searchParams.get("jobDescription") || "").trim();

  if (!rawDesc) {
    return NextResponse.json([], { status: 200 });
  }

  const matched = consultants.filter((c) => matchesDescription(rawDesc, c));

  const primarySelection = matched.slice(0, 10);

  const result: Consultant[] = [...primarySelection];
  if (result.length < 10) {
    for (const c of consultants) {
      if (result.length >= 10) break;
      if (!matched.some((m) => m.id === c.id)) {
        result.push(c);
      }
    }
  }

  return NextResponse.json(result, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
