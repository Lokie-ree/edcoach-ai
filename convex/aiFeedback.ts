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
    indicator: v.object({
      indicator_name: v.string(),
      indicator_code: v.string(),
      overview: v.optional(v.string()),
      key_terms: v.optional(v.string()),
      effective_practice: v.optional(v.string()),
      development_evidence: v.optional(v.string()),
      student_centered_evidence: v.optional(v.string()),
    }),
    promptType: v.union(v.literal("reinforcement"), v.literal("refinement")),
    hasProPlan: v.optional(v.boolean()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Get user and check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, { 
      clerkId: identity.subject 
    });
    if (!user) throw new Error("User not found");

    // Check AI usage limits based on user's plan - NOW PASSING hasProPlan!
    const aiUsage = await ctx.runQuery("plans:getAIUsageThisMonth" as any, {
      hasProPlan: args.hasProPlan
    });
    if (aiUsage.isOverLimit) {
      const planName = aiUsage.plan === "coach_starter" ? "Coach Starter" : "Coach Pro";
      throw new Error(`You've reached your monthly limit of ${aiUsage.limit} AI generations on the ${planName} plan. Please upgrade or wait until next month.`);
    }

    const indicator = args.indicator;
    if (!indicator) throw new Error("Rubric indicator not found");

    const prompt =
      args.promptType === "reinforcement"
        ? `
You are an expert instructional coaching assistant. Your mission is to generate concise, actionable, and rubric-aligned feedback for K-12 teachers in Louisiana. The feedback must be deeply rooted in the provided Louisiana Educator Rubric (LER) indicator, its detailed explanation, key terms, evidence of student-centered learning, and the observer's notes. Maintain a supportive, encouraging, and growth-oriented coaching tone.

Rubric Indicator Details:
- Name/Code: "${indicator.indicator_name}" (${indicator.indicator_code})
- Full Description: "${indicator.overview || ''}"
- Key Terms: "${indicator.key_terms || ''}"
- Explanation/Possible Evidence of Effective Practice: "${indicator.effective_practice || ''}"
- Evidence of Student-Centered Learning: "${indicator.student_centered_evidence || ''}"

Observer's Notes:
"${args.evidence}"

Instructions:
- Acknowledge the teacher's strength related to this LER indicator
- Subtly weave in key terms and concepts from the explanation and student-centered evidence
- Directly connect to specific positive evidence from the observer's notes
- Use professional, supportive language
- Limit to 1-2 sentences
`
        : `
You are an expert instructional coaching assistant. Your mission is to generate concise, actionable, and rubric-aligned feedback for K-12 teachers in Louisiana. The feedback must be deeply rooted in the provided Louisiana Educator Rubric (LER) indicator, its detailed explanation, key terms, evidence of student-centered learning, and the observer's notes. Maintain a supportive, encouraging, and growth-oriented coaching tone.

Rubric Indicator Details:
- Name/Code: "${indicator.indicator_name}" (${indicator.indicator_code})
- Full Description: "${indicator.overview || ''}"
- Key Terms: "${indicator.key_terms || ''}"
- Explanation/Possible Evidence for Development: "${indicator.development_evidence || ''}"
- Evidence of Student-Centered Learning: "${indicator.student_centered_evidence || ''}"

Observer's Notes:
"${args.evidence}"

Instructions:
- Identify an area for growth related to this LER indicator
- Subtly weave in key terms and concepts from the development evidence and student-centered learning
- Suggest one specific, observable, and practical strategy the teacher could implement
- Ensure the strategy aligns with promoting student-centered learning
- Use supportive, professional language
- Limit to 1-2 sentences
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 200,
        temperature: 0.2,
        top_p: 0.95,
      });

      const content = response.choices[0].message.content ?? "";

      // Token/cost tracking
      const promptTokens = response.usage?.prompt_tokens ?? 0;
      const completionTokens = response.usage?.completion_tokens ?? 0;
      const totalTokens = response.usage?.total_tokens ?? 0;
      
      // Pricing for gpt-4o-mini: Input $0.15/M, Output $0.60/M
      const PROMPT_COST_PER_1K = 0.00015;
      const COMPLETION_COST_PER_1K = 0.00060;
      const isCached = await checkIfCached(prompt);
      const promptCost = promptTokens * PROMPT_COST_PER_1K / 1000;
      const completionCost = completionTokens * COMPLETION_COST_PER_1K / 1000;
      const totalCost = promptCost + completionCost;

      // Log usage - this counts towards monthly limit
      await ctx.runMutation(internal.aiFeedbackMutations.logTokenUsage, {
        userId: user._id,
        action: "generateFeedback",
        model: "gpt-4o-mini",
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
        userId: user._id,
        cost: totalCost,
      });

      return content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate AI feedback. Please try again.");
    }
  },
});

