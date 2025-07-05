"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";
import crypto from "crypto";


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

    if (user.role === "coach") {
      // Check AI usage limits based on user's plan - NOW PASSING hasProPlan!
      const aiUsage = await ctx.runQuery("plans:getAIUsageThisMonth" as any, {
        hasProPlan: args.hasProPlan
      });
      if (aiUsage.isOverLimit) {
        const planName = aiUsage.plan === "coach_starter" ? "Coach Starter" : "Coach Pro";
        throw new Error(`You've reached your monthly limit of ${aiUsage.limit} AI generations on the ${planName} plan. Please upgrade or wait until next month.`);
      }
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
        isCached: false,
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

export const generateConsolidatedFeedback = action({
  args: {
    evidence: v.string(),
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
    hasProPlan: v.optional(v.boolean()),
  },
  returns: v.object({
    reinforcement: v.string(),
    refinement: v.string(),
  }),
  handler: async (ctx, args) => {
    // Auth and usage checks (reuse from generateFeedback)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, { clerkId: identity.subject });
    if (!user) throw new Error("User not found");

    if (user.role === "coach") {
      // Check AI usage limits based on user's plan - NOW PASSING hasProPlan!
      const aiUsage = await ctx.runQuery("plans:getAIUsageThisMonth" as any, { hasProPlan: args.hasProPlan });
      if (aiUsage.isOverLimit) {
        const planName = aiUsage.plan === "coach_starter" ? "Coach Starter" : "Coach Pro";
        throw new Error(`You've reached your monthly limit of ${aiUsage.limit} AI generations on the ${planName} plan. Please upgrade or wait until next month.`);
      }
    }

    // Build the single efficient prompt
    const prompt = `You are EdCoach AI, an expert instructional coaching assistant. Your mission is to generate concise, actionable, and rubric-aligned feedback for K-12 teachers in Louisiana, based on brief informal classroom walkthroughs. The feedback must be deeply rooted in the provided Louisiana Educator Rubric (LER) indicators, their detailed explanations, key terms, evidence of student-centered learning, and the observer's notes. Maintain a supportive, encouraging, and growth-oriented coaching tone. The output should be 3-4 sentences total.

**INPUTS:**

*   **Observer's Notes:** "${args.evidence}"

*   **LER Reinforcement Indicator Details:**
    *   **Name/Code:** "${args.reinforcementIndicator.indicator_name}" (${args.reinforcementIndicator.indicator_code})
    *   **Full Description:** "${args.reinforcementIndicator.overview || ''}"
    *   **Key Terms:** "${args.reinforcementIndicator.key_terms || ''}"
    *   **Explanation/Possible Evidence of Effective Practice:** "${args.reinforcementIndicator.effective_practice || ''}"
    *   **Evidence of Student-Centered Learning:** "${args.reinforcementIndicator.student_centered_evidence || ''}"

*   **LER Refinement Indicator Details:**
    *   **Name/Code:** "${args.refinementIndicator.indicator_name}" (${args.refinementIndicator.indicator_code})
    *   **Full Description:** "${args.refinementIndicator.overview || ''}"
    *   **Key Terms:** "${args.refinementIndicator.key_terms || ''}"
    *   **Explanation/Possible Evidence for Development:** "${args.refinementIndicator.development_evidence || ''}"
    *   **Evidence of Student-Centered Learning:** "${args.refinementIndicator.student_centered_evidence || ''}"

**TASK:**

Generate a feedback snippet (target: 3-4 sentences total) for the teacher:

1.  **Reinforcement (1-2 sentences):**
    *   Acknowledge the teacher's strength related to the **LER Reinforcement Indicator**.
    *   Subtly weave in **Key Terms** and concepts from the **Explanation/Possible Evidence of Effective Practice** and **Evidence of Student-Centered Learning** for this indicator.
    *   Directly connect this to specific positive evidence from the **Observer's Notes**.

2.  **Refinement (1-2 sentences):**
    *   Identify an area for growth related to the **LER Refinement Indicator**.
    *   Subtly weave in **Key Terms** and concepts from the **Explanation/Possible Evidence for Development** and **Evidence of Student-Centered Learning** for this indicator.
    *   Based on the **Observer's Notes** and the typical challenges highlighted in the LER Handbook details provided, suggest **one specific, observable, and practical strategy** the teacher could implement. Ensure the strategy aligns with promoting student-centered learning where applicable.

**OUTPUT FORMAT:**
Return the response as JSON with two keys:
- "reinforcement": "[1-2 sentences of reinforcement feedback]"
- "refinement": "[1-2 sentences of refinement feedback]"

**OUTPUT EXPECTATIONS:**
*   Concise (3-4 sentences total).
*   Professional, supportive, and growth-oriented tone.
*   Explicitly (but naturally) incorporates language and concepts from the detailed LER indicator information provided.
*   Highly actionable suggestions.`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 300,
        temperature: 0.2,
        top_p: 0.95,
        response_format: { type: "json_object" },
      });
      const content = response.choices[0].message.content ?? "";
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", content);
        throw new Error("Failed to parse AI response. Please try again.");
      }
      if (!parsedResponse.reinforcement || !parsedResponse.refinement) {
        throw new Error("Invalid AI response structure. Please try again.");
      }
      // Token/cost tracking (reuse from generateFeedback)
      const promptTokens = response.usage?.prompt_tokens ?? 0;
      const completionTokens = response.usage?.completion_tokens ?? 0;
      const totalTokens = response.usage?.total_tokens ?? 0;
      const PROMPT_COST_PER_1K = 0.00015;
      const COMPLETION_COST_PER_1K = 0.00060;
      const promptCost = promptTokens * PROMPT_COST_PER_1K / 1000;
      const completionCost = completionTokens * COMPLETION_COST_PER_1K / 1000;
      const totalCost = promptCost + completionCost;
      await ctx.runMutation(internal.aiFeedbackMutations.logTokenUsage, {
        userId: user._id,
        action: "generateConsolidatedFeedback",
        model: "gpt-4o-mini",
        promptTokens,
        completionTokens,
        totalTokens,
        cost: totalCost,
        isCached: false,
        timestamp: Date.now(),
        metadata: {
          reinforcementIndicator: args.reinforcementIndicator.indicator_code,
          refinementIndicator: args.refinementIndicator.indicator_code,
        },
      });
      await ctx.runMutation(internal.aiFeedbackMutations.checkCostAlerts, {
        userId: user._id,
        cost: totalCost,
      });
      return {
        reinforcement: parsedResponse.reinforcement,
        refinement: parsedResponse.refinement,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate AI feedback. Please try again.");
    }
  },
});

