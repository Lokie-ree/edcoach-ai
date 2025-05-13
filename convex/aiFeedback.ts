"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const generateFeedback = action({
  args: {
    evidence: v.string(),
    indicator: v.any(),
    promptType: v.union(v.literal("reinforcement"), v.literal("refinement")),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const indicator = args.indicator;
    if (!indicator) throw new Error("Rubric indicator not found");

    const prompt =
      args.promptType === "reinforcement"
        ? `
You are an instructional coach. Based on the classroom evidence and the rubric indicator below, generate a concise, positive reinforcement statement for the teacher. Reference the indicator language and be specific.

Rubric Indicator:
"${indicator.indicator_name}" (${indicator.indicator_code}): ${indicator.overview}

Classroom Evidence:
"${args.evidence}"

Instructions:
- Focus on what the teacher did well related to this indicator.
- Use positive, professional language.
- Limit to 1-2 sentences.
`
        : `
You are an instructional coach. Based on the classroom evidence and the rubric indicator below, generate a concise, actionable suggestion for the teacher's growth. Reference the indicator language and be specific.

Rubric Indicator:
"${indicator.indicator_name}" (${indicator.indicator_code}): ${indicator.overview}

Classroom Evidence:
"${args.evidence}"

Instructions:
- Focus on a specific area for growth related to this indicator.
- Suggest one concrete next step.
- Use supportive, professional language.
- Limit to 1-2 sentences.
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini-2025-04-14",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 200,
      temperature: 0.2,
      top_p: 1.0,
    });

    return response.choices[0].message.content ?? "";
  },
});