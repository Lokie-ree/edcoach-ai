"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";

// Helper stub for caching logic (replace with real implementation)
async function checkIfCached(prompt: string): Promise<boolean> {
  // TODO: Implement actual cache check
  return false;
}

export const generateFeedback = action({
  args: {
    evidence: v.string(),
    indicator: v.any(),
    promptType: v.union(v.literal("reinforcement"), v.literal("refinement")),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
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

    // Get userId from Clerk identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, { clerkId: identity.subject });
    if (!user) throw new Error("User not found");
    const userId = user._id;

    // Token/cost tracking
    const promptTokens = response.usage?.prompt_tokens ?? 0;
    const completionTokens = response.usage?.completion_tokens ?? 0;
    const totalTokens = response.usage?.total_tokens ?? 0;
    // Pricing as of 2024-06: Input $0.40/M, Cached $0.10/M, Output $1.60/M
    const PROMPT_COST_PER_1K = 0.00040;
    const CACHED_PROMPT_COST_PER_1K = 0.00010;
    const COMPLETION_COST_PER_1K = 0.00160;
    const isCached = await checkIfCached(prompt);
    const promptCost = isCached ? (promptTokens * CACHED_PROMPT_COST_PER_1K / 1000) : (promptTokens * PROMPT_COST_PER_1K / 1000);
    const completionCost = completionTokens * COMPLETION_COST_PER_1K / 1000;
    const totalCost = promptCost + completionCost;

    // Log usage
    await ctx.runMutation(internal.aiFeedbackMutations.logTokenUsage, {
      userId,
      action: "generateFeedback",
      model: "gpt-4.1-mini-2025-04-14",
      promptTokens,
      completionTokens,
      totalTokens,
      cost: totalCost,
      isCached,
      timestamp: Date.now(),
      metadata: {
        promptType: args.promptType,
        indicatorCode: indicator.indicator_code,
      },
    });

    // Check for cost alerts
    await ctx.runMutation(internal.aiFeedbackMutations.checkCostAlerts, {
      userId,
      cost: totalCost,
    });

    return response.choices[0].message.content ?? "";
  },
});

