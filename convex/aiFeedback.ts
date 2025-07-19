"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";
import { api } from "./_generated/api";

const indicatorValidator = v.object({
  indicator_name: v.string(),
  indicator_code: v.string(),
  domain: v.optional(v.string()),
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
      v.literal("both"),
    ),
    reinforcementIndicator: v.optional(indicatorValidator),
    refinementIndicator: v.optional(indicatorValidator),
    hasProPlan: v.optional(v.boolean()),
    hasStarterPlan: v.optional(v.boolean()),
    teacherId: v.optional(v.id("teachers")), // NEW: Add teacherId for PGP context
  },
  returns: v.union(
    v.string(),
    v.object({
      reinforcement: v.string(),
      refinement: v.string(),
    }),
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
      const aiUsage = await ctx.runQuery(api.plans.getAIUsageThisMonth, {
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
      throw new Error(
        "Reinforcement indicator required for reinforcement mode",
      );
    }
    if (args.mode === "refinement" && !args.refinementIndicator) {
      throw new Error("Refinement indicator required for refinement mode");
    }
    if (
      args.mode === "both" &&
      (!args.reinforcementIndicator || !args.refinementIndicator)
    ) {
      throw new Error("Both indicators required for both mode");
    }

    // NEW: Get teacher's PGP goal if teacherId is provided
    let pgpContext = "";
    if (args.teacherId) {
      try {
        const pgpData = await ctx.runQuery(
          internal.analytics.getTeacherPgpData,
          {
            teacherId: args.teacherId,
          },
        );
        if (pgpData && pgpData.pgpGoal) {
          pgpContext = `\n\nTeacher's Professional Growth Goal: "${pgpData.pgpGoal.title}" - ${pgpData.pgpGoal.description}`;
        }
      } catch (error) {
        console.warn("Failed to fetch PGP data:", error);
        // Continue without PGP context if there's an error
      }
    }

    // Build optimized prompt with PGP context
    const buildPrompt = () => {
      const basePrompt = `You are an expert educational coach providing feedback to K-12 teachers based on the Louisiana Educator Rubric. Your feedback should be:

1. SPECIFIC - Reference concrete examples from the evidence provided
2. ACTIONABLE - Provide clear next steps or strategies
3. SUPPORTIVE - Use growth-oriented, encouraging language
4. EVIDENCE-BASED - Connect feedback directly to rubric indicators
5. CONCISE - Keep responses focused and impactful (2-3 sentences)

Evidence: "${args.evidence}"${pgpContext}`;

      if (args.mode === "both") {
        return `${basePrompt}

REINFORCEMENT INDICATOR: ${args.reinforcementIndicator!.indicator_name} (${args.reinforcementIndicator!.indicator_code})
Domain: ${args.reinforcementIndicator!.domain || "N/A"}
Overview: ${args.reinforcementIndicator!.overview || "N/A"}
Key Terms: ${args.reinforcementIndicator!.key_terms || "N/A"}
Effective Practice: ${args.reinforcementIndicator!.effective_practice || "N/A"}

REFINEMENT INDICATOR: ${args.refinementIndicator!.indicator_name} (${args.refinementIndicator!.indicator_code})
Domain: ${args.refinementIndicator!.domain || "N/A"}
Overview: ${args.refinementIndicator!.overview || "N/A"}
Key Terms: ${args.refinementIndicator!.key_terms || "N/A"}
Development Evidence: ${args.refinementIndicator!.development_evidence || "N/A"}

Generate:
1. REINFORCEMENT: Acknowledge specific strengths demonstrated in the evidence, connecting to the reinforcement indicator criteria
2. REFINEMENT: Suggest specific, actionable improvements related to the refinement indicator, with concrete strategies${pgpContext ? "\n\nIMPORTANT: Connect your feedback to the teacher's professional growth goal when relevant." : ""}

Return JSON: {"reinforcement": "...", "refinement": "..."}`;
      } else {
        const indicator =
          args.mode === "reinforcement"
            ? args.reinforcementIndicator!
            : args.refinementIndicator!;
        const isReinforcement = args.mode === "reinforcement";

        return `${basePrompt}

INDICATOR: ${indicator.indicator_name} (${indicator.indicator_code})
Domain: ${indicator.domain || "N/A"}
Overview: ${indicator.overview || "N/A"}
Key Terms: ${indicator.key_terms || "N/A"}
${isReinforcement ? `Effective Practice: ${indicator.effective_practice || "N/A"}` : `Development Evidence: ${indicator.development_evidence || "N/A"}`}

Generate ${isReinforcement ? "reinforcement" : "refinement"} feedback: ${isReinforcement ? "Acknowledge specific strengths demonstrated in the evidence" : "Suggest specific, actionable improvements with concrete strategies"} related to this indicator.${pgpContext ? "\n\nIMPORTANT: Connect your feedback to the teacher's professional growth goal when relevant." : ""}`;
      }
    };

    // Add debugging logs
    console.log("🔍 AI Feedback Generation Debug:", {
      mode: args.mode,
      evidenceLength: args.evidence.length,
      reinforcementIndicator: args.reinforcementIndicator
        ? {
            name: args.reinforcementIndicator.indicator_name,
            code: args.reinforcementIndicator.indicator_code,
            hasOverview: !!args.reinforcementIndicator.overview,
            hasKeyTerms: !!args.reinforcementIndicator.key_terms,
            hasEffectivePractice:
              !!args.reinforcementIndicator.effective_practice,
          }
        : null,
      refinementIndicator: args.refinementIndicator
        ? {
            name: args.refinementIndicator.indicator_name,
            code: args.refinementIndicator.indicator_code,
            hasOverview: !!args.refinementIndicator.overview,
            hasKeyTerms: !!args.refinementIndicator.key_terms,
            hasDevelopmentEvidence:
              !!args.refinementIndicator.development_evidence,
          }
        : null,
      teacherId: args.teacherId,
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: buildPrompt() }],
        max_tokens: args.mode === "both" ? 400 : 200, // Increase token limits
        temperature: 0.2, // Lower temperature for more consistent quality
        top_p: 0.9,
        ...(args.mode === "both" && {
          response_format: { type: "json_object" },
        }),
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
          teacherId: args.teacherId, // NEW: Track teacherId in metadata
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
