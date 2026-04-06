import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type CoachReview = {
  score: number;
  categories: { label: string; value: number }[];
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
};

function extractProjects(text: string): string[] {
  if (!text) return [];

  return text
    .split("\n")
    .filter((line) => {
      const normalized = line.toLowerCase();
      return (
        normalized.includes("project") ||
        normalized.includes("built") ||
        normalized.includes("developed")
      );
    })
    .slice(0, 8);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY" },
        { status: 500 },
      );
    }

    const groq = new Groq({ apiKey });

    const formData = await req.formData();

    const audioFile = formData.get("audio") as File | null;
    const company = (formData.get("company") as string) || "General Company";
    const role = (formData.get("role") as string) || "Software Engineer";
    const resumeText = (formData.get("resumeText") as string) || "";
    const endInterview = formData.get("endInterview") === "true";

    await new Promise((resolve) => setTimeout(resolve, 600));

    const isEmptyAudio = !audioFile || audioFile.size === 0;
    let transcriptText = "";

    if (!isEmptyAudio) {
      const wrapped = new File([audioFile], "audio.webm", { type: "audio/webm" });

      const transcription = await groq.audio.transcriptions.create({
        file: wrapped,
        model: "whisper-large-v3",
      });

      transcriptText = (transcription.text || "").trim();
    } else {
      transcriptText = endInterview
        ? "[User ended the interview and requested feedback.]"
        : "";
    }

    const detectedProjects = extractProjects(resumeText);
    const projectList =
      detectedProjects.length > 0
        ? detectedProjects.map((project) => `- ${project}`).join("\n")
        : "- [No clear projects detected from resume text]";

    if (!endInterview) {
      const systemPromptInterview = `
You are a realistic human interviewer.
Warm, conversational, human. Not robotic.

INTERVIEW RULES:
- Respond naturally to what the candidate said.
- Give 1 to 2 sentences of reaction.
- Ask exactly one follow-up question.
- Do not provide feedback.
- Do not score.
- Do not break character.

RESUME:
${resumeText || "[None]"}

PROJECT HINTS:
${projectList}
`;

      const userPrompt = transcriptText
        ? `Candidate said: "${transcriptText}" — respond in interview mode.`
        : `Start the interview for ${role} at ${company}. Greet them naturally and begin.`;

      const chatResponse = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPromptInterview },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const reply =
        chatResponse.choices[0]?.message?.content?.trim() ||
        "Let's get started. Walk me through your background.";

      return NextResponse.json({
        transcript: transcriptText,
        reply,
        ended: false,
      });
    }

    const systemPromptCoach = `
You are a FAANG-level senior interviewer giving harsh, strict review.

You must penalize short interviews heavily.

WORD COUNT RULES:
If the word count is below 120 or there are fewer than 3 total answers:
- Final score must be between 1 and 3.
- Category scores must be between 1 and 4.
- Summary must include: "The interview was extremely short, which severely impacted your evaluation."

If the word count is between 120 and 300:
- Final score max is 6.

If the word count is above 300:
- Score normally, still strict.

OUTPUT JSON ONLY:
{
  "score": number,
  "categories": [
    { "label": "Communication Clarity", "value": number },
    { "label": "Confidence & Delivery", "value": number },
    { "label": "Technical Strength", "value": number },
    { "label": "Project & Resume Depth", "value": number },
    { "label": "Problem Solving & Thinking", "value": number },
    { "label": "Role Fit for ${role}", "value": number }
  ],
  "summary": "strict paragraph",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "nextSteps": ["...", "..."]
}
`;

    const userPromptCoach = `
TRANSCRIPT:
${transcriptText}

RESUME:
${resumeText}

PROJECTS:
${projectList}

Generate strict JSON only.
`;

    const coachResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPromptCoach },
        { role: "user", content: userPromptCoach },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const raw = coachResponse.choices[0]?.message?.content?.trim() || "";

    let review: CoachReview;

    try {
      review = JSON.parse(raw) as CoachReview;
    } catch {
      review = {
        score: 2,
        categories: [
          { label: "Communication Clarity", value: 2 },
          { label: "Confidence & Delivery", value: 2 },
          { label: "Technical Strength", value: 2 },
          { label: "Project & Resume Depth", value: 2 },
          { label: "Problem Solving & Thinking", value: 2 },
          { label: `Role Fit for ${role}`, value: 2 },
        ],
        summary:
          "The interview response was too short or malformed for proper evaluation.",
        strengths: [],
        improvements: ["Provide complete answers and stay in the interview longer."],
        nextSteps: ["Complete at least 3 to 5 questions before ending the session."],
      };
    }

    return NextResponse.json({
      transcript: transcriptText,
      review,
      ended: true,
    });
  } catch (err) {
    console.error("Voice API error:", err);
    return NextResponse.json(
      { error: "Voice interview processing failed" },
      { status: 500 },
    );
  }
}
