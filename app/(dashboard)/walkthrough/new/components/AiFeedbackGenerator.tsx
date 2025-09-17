import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AIUsageBadge, AIUsageWarning } from "@/components/common/AiUsageBadge";
import { Sparkles, AlertTriangle, Crown, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ICONS, STATUS_COLORS } from "@/lib/design-tokens";

interface AIFeedbackGeneratorProps {
  evidence: string;
  indicator: {
    indicator_name: string;
    indicator_code: string;
    domain?: string;
    overview?: string;
    key_terms?: string;
    effective_practice?: string;
    development_evidence?: string;
    student_centered_evidence?: string;
  };
  promptType: "reinforcement" | "refinement";
  onFeedbackGenerated: (feedback: string) => void;
  className?: string;
}

export function AIFeedbackGenerator({
  evidence,
  indicator,
  promptType,
  onFeedbackGenerated,
  className,
}: AIFeedbackGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFeedback, setGeneratedFeedback] = useState<string>("");

  const { has } = useAuth();
  const generateAIFeedback = useAction(api.aiFeedback.generateAIFeedback);
  const usageInfo = useQuery(api.users.checkAIUsageLimit);

  const handleGenerate = async () => {
    if (!evidence.trim()) {
      toast.error("Please provide evidence before generating feedback");
      return;
    }

    if (!usageInfo?.canGenerate) {
      toast.error(
        "AI generation limit reached. Please upgrade to Pro for unlimited access.",
      );
      return;
    }

    try {
      setIsGenerating(true);

      // Check for PAID Pro plan only - free users get starter plan by default
      const hasProPlan =
        (has?.({ plan: "coach_pro" }) ?? false) ||
        (has?.({ permission: "coach_pro" }) ?? false) ||
        (has?.({ role: "coach_pro" }) ?? false);

      // All users without a paid Pro plan get starter plan benefits by default
      const hasStarterPlan = !hasProPlan;

      console.log("🔍 AI Feedback Generator plan check:", {
        hasProPlan,
        finalPlan: hasProPlan ? "pro" : "starter_free",
        checks: {
          "plan:coach_pro": has?.({ plan: "coach_pro" }),
          "permission:coach_pro": has?.({ permission: "coach_pro" }),
          "role:coach_pro": has?.({ role: "coach_pro" }),
          "plan:coach_starter": has?.({ plan: "coach_starter" }),
          "permission:coach_starter": has?.({ permission: "coach_starter" }),
          "role:coach_starter": has?.({ role: "coach_starter" }),
          "role:admin": has?.({ role: "admin" }),
        },
      });

      // Improved normalization function
      const normalizeIndicatorField = (val: unknown): string => {
        if (!val) return "N/A";

        if (Array.isArray(val)) {
          return val
            .filter((item) => item && typeof item === "string")
            .join("; ");
        }

        if (typeof val === "object" && val !== null) {
          const values = Object.values(val as Record<string, unknown>);
          return values
            .filter((item) => item && typeof item === "string")
            .join("; ");
        }

        return (val as string) || "N/A";
      };

      const feedback = (await generateAIFeedback({
        evidence,
        mode: promptType,
        [promptType === "reinforcement"
          ? "reinforcementIndicator"
          : "refinementIndicator"]: {
          indicator_name: indicator.indicator_name,
          indicator_code: indicator.indicator_code,
          domain: indicator.domain || "N/A",
          overview: normalizeIndicatorField(indicator.overview),
          key_terms: normalizeIndicatorField(indicator.key_terms),
          effective_practice: normalizeIndicatorField(
            indicator.effective_practice,
          ),
          development_evidence: normalizeIndicatorField(
            indicator.development_evidence,
          ),
          student_centered_evidence: normalizeIndicatorField(
            indicator.student_centered_evidence,
          ),
        },
        hasProPlan,
        hasStarterPlan,
      })) as string;

      setGeneratedFeedback(feedback);
      onFeedbackGenerated(feedback);

      toast.success(
        `${promptType === "reinforcement" ? "Reinforcement" : "Refinement"} feedback generated!`,
      );
    } catch (error: unknown) {
      console.error("Failed to generate AI feedback:", error);

      if (
        error instanceof Error &&
        error.message?.includes("AI usage limit exceeded")
      ) {
        toast.error(
          "You&apos;ve reached your monthly AI generation limit. Upgrade to Pro for unlimited access.",
          {
            duration: 5000,
            action: {
              label: "Upgrade",
              onClick: () => {
                // TODO: Implement upgrade flow
                console.log("Navigate to upgrade page");
              },
            },
          },
        );
      } else {
        toast.error("Failed to generate feedback. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUse = () => {
    if (generatedFeedback) {
      onFeedbackGenerated(generatedFeedback);
      toast.success("Feedback applied!");
    }
  };

  const canGenerate = usageInfo?.canGenerate ?? false;
  const isPro = true; // Simplified - no subscription restrictions for now

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className={cn(ICONS.semantic.header, "text-purple-500")} />
            AI Feedback Generator
          </CardTitle>
          <AIUsageBadge />
        </div>
        <CardDescription>
          Generate{" "}
          {promptType === "reinforcement" ? "reinforcement" : "refinement"}{" "}
          feedback for{" "}
          <span className="font-medium">{indicator.indicator_name}</span> (
          {indicator.indicator_code})
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Usage Warning */}
        <AIUsageWarning />

        {/* Evidence Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Evidence</Label>
          <div className="bg-muted/50 p-3 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              {evidence || "No evidence provided"}
            </p>
          </div>
        </div>

        {/* Generation Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating || !evidence.trim()}
              className={cn(
                "flex items-center gap-2",
                promptType === "reinforcement"
                  ? cn(STATUS_COLORS.success.bg, "hover:bg-green-700")
                  : cn(STATUS_COLORS.info.bg, "hover:bg-blue-700"),
              )}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className={ICONS.semantic.inline} />
                  Generate{" "}
                  {promptType === "reinforcement"
                    ? "Reinforcement"
                    : "Refinement"}{" "}
                  Feedback
                </>
              )}
            </Button>

            {!canGenerate && !isPro && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className={ICONS.sizes.xs} />
                Limit reached
              </Badge>
            )}
          </div>

          {!canGenerate && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Zap className={cn(ICONS.semantic.inline, "text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0")} />
                <div className="text-sm">
                  <p className="text-amber-800 dark:text-amber-200 font-medium">
                    AI Generation Limit Reached
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    You&apos;ve used all {usageInfo?.limit} AI generations for
                    this month. Upgrade to Pro for unlimited AI generations and
                    advanced features.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Crown className={cn(ICONS.sizes.xs, "mr-1")} />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generated Feedback Display */}
        {generatedFeedback && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Generated Feedback
                </Label>
                <Badge
                  variant="secondary"
                  className={cn(
                    promptType === "reinforcement"
                      ? cn(STATUS_COLORS.success.bg, STATUS_COLORS.success.text)
                      : cn(STATUS_COLORS.info.bg, STATUS_COLORS.info.text),
                  )}
                >
                  {promptType === "reinforcement"
                    ? "Reinforcement"
                    : "Refinement"}
                </Badge>
              </div>

              <Textarea
                value={generatedFeedback}
                onChange={(e) => setGeneratedFeedback(e.target.value)}
                placeholder="Generated feedback will appear here..."
                className="min-h-[100px] resize-none"
              />

              <div className="flex gap-2">
                <Button onClick={handleUse} variant="default">
                  Use This Feedback
                </Button>
                <Button
                  onClick={handleGenerate}
                  variant="outline"
                  disabled={!canGenerate || isGenerating}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Pro Features Hint */}
        {!isPro && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Crown className={cn(ICONS.semantic.inline, "text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0")} />
              <div className="text-sm">
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                  Upgrade to Pro for unlimited AI generations
                </p>
                <p className="text-purple-700 dark:text-purple-300 mt-1">
                  Get unlimited AI feedback generation, advanced features, and
                  priority support.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
