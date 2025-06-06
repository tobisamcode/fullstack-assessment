// app/api/evaluate/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";

import consultants from "@/app/data";
import type { Consultant, JobDescription } from "@/app/type";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

if (!OPENAI_API_KEY) {
  throw new Error(
    "Missing OpenAI API key. Set OPENAI_API_KEY in your environment."
  );
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface EvaluateRequest {
  jobDescription: JobDescription;
  consultantId: string;
}

interface Evaluation {
  fitScore: number;
  summary: string;
  pros: string[];
  cons: string[];
  questions: string[];
}

function buildPrompt(
  jobDescription: JobDescription,
  consultant: Consultant
): string {
  return [
    `You are an AI assistant evaluating one consultant against a job description.`,
    ``,
    `Job Description:`,
    `"""`,
    jobDescription.trim(),
    `"""`,
    ``,
    `Consultant Profile:`,
    `- Name: ${consultant.name}`,
    `- Role: ${consultant.role}`,
    `- Location: ${consultant.location}`,
    `- Years of Experience: ${consultant.yearsOfExp}`,
    `- Skills: ${consultant.skills.join(", ")}`,
    `- Bio: ${consultant.bio}`,
    ``,
    `Please respond with strictly valid JSON (no extra commentary). The JSON must contain:`,
    `{\n  "fitScore": <integer between 0 and 100>,`,
    `  "summary": "<1–2 sentence explanation of fit or mismatch>",`,
    `  "pros": ["<strength1>", "<strength2>", …],`,
    `  "cons": ["<weakness1>", "<weakness2>", …],`,
    `  "questions": ["<suggestedQuestion1>", "<suggestedQuestion2>"]\n}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body: EvaluateRequest = await request.json();

    const { jobDescription, consultantId } = body;
    if (!jobDescription || !consultantId) {
      return NextResponse.json(
        { error: "Both `jobDescription` and `consultantId` are required." },
        { status: 400 }
      );
    }

    const consultant = consultants.find((c) => c.id === consultantId);
    if (!consultant) {
      return NextResponse.json(
        { error: `Consultant with ID "${consultantId}" not found.` },
        { status: 404 }
      );
    }

    const prompt = buildPrompt(jobDescription, consultant);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content;
    if (typeof raw !== "string") {
      return NextResponse.json(
        { error: "Received empty response from OpenAI." },
        { status: 500 }
      );
    }

    let evaluation: Evaluation;
    try {
      evaluation = JSON.parse(raw);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse LLM response as JSON.",
          rawResponse: raw,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ consultantId, evaluation }, { status: 200 });
  } catch (err: unknown) {
    console.error("Error in /api/evaluate:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "LLM inference failed.", details: message },
      { status: 500 }
    );
  }
}
