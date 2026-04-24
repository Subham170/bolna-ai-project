import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const buildPrompt = ({ transcript, jobDescription, jobTitle }) => `
You are an expert technical recruiter.
Evaluate this screening call transcript against the job description.
Return only valid JSON (no markdown fences, no extra text).

Job Title: ${jobTitle}
Job Description:
${jobDescription}

Candidate Transcript:
${transcript}

Return JSON exactly in this shape:
{
  "scoreBreakdown": {
    "skillMatch": 0-10,
    "communication": 0-10,
    "salaryFit": 0-10,
    "availabilityFit": 0-10
  },
  "extractedAnswers": {
    "availability": "string",
    "expectedSalary": "string",
    "skills": ["string"],
    "noticePeriod": "string",
    "locationPreference": "string"
  },
  "recommendation": "STRONG_YES|MAYBE|NO",
  "reasoning": "2-4 short sentences",
  "redFlags": ["string"]
}
`;

const parseModelJson = (text) => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
};

const scoreTranscriptWithGemini = async ({ transcript, jobDescription, jobTitle }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = buildPrompt({ transcript, jobDescription, jobTitle });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseModelJson(text);

  return {
    ...parsed,
    rawModelOutput: text,
  };
};

export { scoreTranscriptWithGemini };
