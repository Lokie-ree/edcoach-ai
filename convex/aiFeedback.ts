"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";

const indicatorValidator = v.object({
  indicator_name: v.string(),
  indicator_code: v.string(),
  overview: v.optional(v.string()),
  key_terms: v.optional(v.string()),
  effective_practice: v.optional(v.string()),
  development_evidence: v.optional(v.string()),
  student_centered_evidence: v.optional(v.string()),
});

export const generateAIFeedback = action({
  args: {
    evidence: v.string(),
    mode: v.union(
      v.literal("reinforcement"),
      v.literal("refinement"),
      v.literal("both")
    ),
    reinforcementIndicator: v.optional(indicatorValidator),
    refinementIndicator: v.optional(indicatorValidator),
    hasProPlan: v.optional(v.boolean()),
    hasStarterPlan: v.optional(v.boolean()),
  },
  returns: v.union(
    v.string(),
    v.object({
      reinforcement: v.string(),
      refinement: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // Authentication and usage checks
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) throw new Error("User not found");

    if (user.role === "coach") {
      const aiUsage = await ctx.runQuery("plans:getAIUsageThisMonth" as any, {
        hasProPlan: args.hasProPlan,
        hasStarterPlan: args.hasStarterPlan,
      });
      if (aiUsage.isOverLimit) {
        const planName =
          aiUsage.plan === "free"
            ? "Coach Free"
            : aiUsage.plan === "coach_starter"
              ? "Coach Starter"
              : "Coach Pro";
        throw new Error(
          `You've reached your monthly limit of ${aiUsage.limit} AI generations on the ${planName} plan. Please upgrade or wait until next month.`,
        );
      }
    }

    // Validate inputs based on mode
    if (args.mode === "reinforcement" && !args.reinforcementIndicator) {
      throw new Error("Reinforcement indicator required for reinforcement mode");
    }
    if (args.mode === "refinement" && !args.refinementIndicator) {
      throw new Error("Refinement indicator required for refinement mode");
    }
    if (args.mode === "both" && (!args.reinforcementIndicator || !args.refinementIndicator)) {
      throw new Error("Both indicators required for both mode");
    }

    // Build optimized prompt
    const buildPrompt = () => {
      const basePrompt = `Generate concise, actionable feedback for a K-12 teacher based on Louisiana Educator Rubric indicators. Use supportive, growth-oriented language. Keep responses to 1-2 sentences each.

Evidence: "${args.evidence}"`;

      if (args.mode === "both") {
        return `${basePrompt}

Reinforcement Indicator: ${args.reinforcementIndicator!.indicator_name} (${args.reinforcementIndicator!.indicator_code})
Key Terms: ${args.reinforcementIndicator!.key_terms || "N/A"}
Effective Practice: ${args.reinforcementIndicator!.effective_practice || "N/A"}

Refinement Indicator: ${args.refinementIndicator!.indicator_name} (${args.refinementIndicator!.indicator_code})
Key Terms: ${args.refinementIndicator!.key_terms || "N/A"}
Development Evidence: ${args.refinementIndicator!.development_evidence || "N/A"}

Generate:
1. Reinforcement: Acknowledge strength related to the reinforcement indicator
2. Refinement: Suggest specific improvement related to the refinement indicator

Return JSON: {"reinforcement": "...", "refinement": "..."}`;
      } else {
        const indicator = args.mode === "reinforcement" ? args.reinforcementIndicator! : args.refinementIndicator!;
        const isReinforcement = args.mode === "reinforcement";
        
        return `${basePrompt}

Indicator: ${indicator.indicator_name} (${indicator.indicator_code})
Key Terms: ${indicator.key_terms || "N/A"}
${isReinforcement ? `Effective Practice: ${indicator.effective_practice || "N/A"}` : `Development Evidence: ${indicator.development_evidence || "N/A"}`}

Generate ${isReinforcement ? "reinforcement" : "refinement"} feedback: ${isReinforcement ? "Acknowledge strength" : "Suggest specific improvement"} related to this indicator.`;
      }
    };

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: buildPrompt() }],
        max_tokens: args.mode === "both" ? 250 : 150,
        temperature: 0.3,
        top_p: 0.9,
        ...(args.mode === "both" && { response_format: { type: "json_object" } }),
      });

      const content = response.choices[0].message.content ?? "";

      // Parse response based on mode
      let result: string | { reinforcement: string; refinement: string };
      if (args.mode === "both") {
        try {
          const parsed = JSON.parse(content);
          if (!parsed.reinforcement || !parsed.refinement) {
            throw new Error("Invalid JSON structure");
          }
          result = parsed;
        } catch {
          throw new Error("Failed to parse AI response");
        }
      } else {
        result = content;
      }

      // Token tracking
      const promptTokens = response.usage?.prompt_tokens ?? 0;
      const completionTokens = response.usage?.completion_tokens ?? 0;
      const totalTokens = response.usage?.total_tokens ?? 0;

      const PROMPT_COST_PER_1K = 0.00015;
      const COMPLETION_COST_PER_1K = 0.0006;
      const promptCost = (promptTokens * PROMPT_COST_PER_1K) / 1000;
      const completionCost = (completionTokens * COMPLETION_COST_PER_1K) / 1000;
      const totalCost = promptCost + completionCost;

      await ctx.runMutation(internal.aiFeedbackMutations.logTokenUsage, {
        userId: user._id,
        action: "generateAIFeedback",
        model: "gpt-4.1-mini",
        promptTokens,
        completionTokens,
        totalTokens,
        cost: totalCost,
        isCached: false,
        timestamp: Date.now(),
        metadata: {
          mode: args.mode,
          reinforcementIndicator: args.reinforcementIndicator?.indicator_code,
          refinementIndicator: args.refinementIndicator?.indicator_code,
        },
      });

      await ctx.runMutation(internal.aiFeedbackMutations.checkCostAlerts, {
        userId: user._id,
        cost: totalCost,
      });

      return result;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate AI feedback. Please try again.");
    }
  },
});


