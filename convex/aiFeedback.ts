"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal, api } from "./_generated/api";

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
  },
  returns: v.string(),
  handler: async (ctx, args) => {
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

export const generateWalkthroughFeedback = action({
  args: {
    reinforcementIndicator: v.object({
      indicatorAcronym: v.string(),
      indicatorName: v.string(),
      overview: v.optional(v.string()),
      keyTerms: v.optional(v.string()),
      effectivePractice: v.optional(v.string()),
      studentCenteredEvidence: v.optional(v.string()),
    }),
    refinementIndicator: v.object({
      indicatorAcronym: v.string(),
      indicatorName: v.string(),
      overview: v.optional(v.string()),
      keyTerms: v.optional(v.string()),
      developmentEvidence: v.optional(v.string()),
      studentCenteredEvidence: v.optional(v.string()),
    }),
    evidenceSummary: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const prompt = `You are EdCoach AI, an expert instructional coaching assistant. Your mission is to generate concise, actionable, and rubric-aligned feedback for K-12 teachers in Louisiana. The feedback must be deeply rooted in the provided Louisiana Educator Rubric (LER) indicators, their detailed explanations, key terms, evidence of student-centered learning, and the observer's notes. Maintain a supportive, encouraging, and growth-oriented coaching tone.

Reinforcement Indicator Details:
- Name/Code: "${args.reinforcementIndicator.indicatorName}" (${args.reinforcementIndicator.indicatorAcronym})
- Full Description: "${args.reinforcementIndicator.overview || ''}"
- Key Terms: "${args.reinforcementIndicator.keyTerms || ''}"
- Explanation/Possible Evidence of Effective Practice: "${args.reinforcementIndicator.effectivePractice || ''}"
- Evidence of Student-Centered Learning: "${args.reinforcementIndicator.studentCenteredEvidence || ''}"

Refinement Indicator Details:
- Name/Code: "${args.refinementIndicator.indicatorName}" (${args.refinementIndicator.indicatorAcronym})
- Full Description: "${args.refinementIndicator.overview || ''}"
- Key Terms: "${args.refinementIndicator.keyTerms || ''}"
- Explanation/Possible Evidence for Development: "${args.refinementIndicator.developmentEvidence || ''}"
- Evidence of Student-Centered Learning: "${args.refinementIndicator.studentCenteredEvidence || ''}"

Observer's Notes:
"${args.evidenceSummary}"

Instructions:
1. Reinforcement (1-2 sentences):
   - Acknowledge the teacher's strength related to the reinforcement indicator
   - Subtly weave in key terms and concepts from the effective practice and student-centered evidence
   - Directly connect to specific positive evidence from the observer's notes

2. Refinement (1-2 sentences):
   - Identify an area for growth related to the refinement indicator
   - Subtly weave in key terms and concepts from the development evidence and student-centered learning
   - Suggest one specific, observable, and practical strategy the teacher could implement
   - Ensure the strategy aligns with promoting student-centered learning

Output Expectations:
- Concise (3-4 sentences total)
- Professional, supportive, and growth-oriented tone
- Explicitly (but naturally) incorporates language and concepts from the LER indicators
- Highly actionable suggestions`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini-2025-04-14",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 400,
      temperature: 0.2,
      top_p: 1.0,
    });

    // Get userId from Clerk identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, { clerkId: identity.subject });
    if (!user) throw new Error("User not found");
    const userId = user._id;

    // Token/cost tracking (same as before)
    const promptTokens = response.usage?.prompt_tokens ?? 0;
    const completionTokens = response.usage?.completion_tokens ?? 0;
    const totalTokens = response.usage?.total_tokens ?? 0;
    const PROMPT_COST_PER_1K = 0.00040;
    const CACHED_PROMPT_COST_PER_1K = 0.00010;
    const COMPLETION_COST_PER_1K = 0.00160;
    const isCached = false; // No caching for this action
    const promptCost = isCached ? (promptTokens * CACHED_PROMPT_COST_PER_1K / 1000) : (promptTokens * PROMPT_COST_PER_1K / 1000);
    const completionCost = completionTokens * COMPLETION_COST_PER_1K / 1000;
    const totalCost = promptCost + completionCost;

    // Log usage
    await ctx.runMutation(internal.aiFeedbackMutations.logTokenUsage, {
      userId,
      action: "generateWalkthroughFeedback",
      model: "gpt-4.1-mini-2025-04-14",
      promptTokens,
      completionTokens,
      totalTokens,
      cost: totalCost,
      isCached,
      timestamp: Date.now(),
      metadata: {
        reinforcementIndicator: args.reinforcementIndicator.indicatorAcronym,
        refinementIndicator: args.refinementIndicator.indicatorAcronym,
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

export const generateSplitWalkthroughFeedback = action({
  args: {
    reinforcementIndicator: v.object({
      indicator_name: v.string(),
      indicator_code: v.string(),
      overview: v.optional(v.string()),
      key_terms: v.optional(v.string()),
      effective_practice: v.optional(v.string()),
      development_evidence: v.optional(v.string()),
      student_centered_evidence: v.optional(v.string()),
    }),
    refinementIndicator: v.object({
      indicator_name: v.string(),
      indicator_code: v.string(),
      overview: v.optional(v.string()),
      key_terms: v.optional(v.string()),
      effective_practice: v.optional(v.string()),
      development_evidence: v.optional(v.string()),
      student_centered_evidence: v.optional(v.string()),
    }),
    evidenceSummary: v.string(),
  },
  returns: v.object({
    reinforcement: v.string(),
    refinement: v.string(),
  }),
  handler: async (ctx, args): Promise<{ reinforcement: string; refinement: string }> => {
    // Call generateFeedback for reinforcement
    const reinforcement: string = await ctx.runAction(api.aiFeedback.generateFeedback, {
      evidence: args.evidenceSummary,
      indicator: args.reinforcementIndicator,
      promptType: "reinforcement",
    });
    // Call generateFeedback for refinement
    const refinement: string = await ctx.runAction(api.aiFeedback.generateFeedback, {
      evidence: args.evidenceSummary,
      indicator: args.refinementIndicator,
      promptType: "refinement",
    });
    return { reinforcement, refinement };
  },
});

