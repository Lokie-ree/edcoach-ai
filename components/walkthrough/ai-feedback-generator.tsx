import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AIUsageBadge, AIUsageWarning } from "@/components/ui/ai-usage-badge";
import { Sparkles, AlertTriangle, Crown, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIFeedbackGeneratorProps {
  evidence: string;
  indicator: {
    indicator_name: string;
    indicator_code: string;
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
  
  const generateFeedback = useAction(api.aiFeedback.generateFeedback);
  const usageInfo = useQuery(api.users.checkAIUsageLimit);

  const handleGenerate = async () => {
    if (!evidence.trim()) {
      toast.error("Please provide evidence before generating feedback");
      return;
    }

    if (!usageInfo?.canGenerate) {
      toast.error("AI generation limit reached. Please upgrade to Pro for unlimited access.");
      return;
    }

    try {
      setIsGenerating(true);
      const feedback = await generateFeedback({
        evidence,
        indicator: {
          indicator_name: indicator.indicator_name,
          indicator_code: indicator.indicator_code,
          overview: indicator.overview,
          key_terms: indicator.key_terms,
          effective_practice: indicator.effective_practice,
          development_evidence: indicator.development_evidence,
          student_centered_evidence: indicator.student_centered_evidence,
        },
        promptType,
      });

      setGeneratedFeedback(feedback);
      onFeedbackGenerated(feedback);
      
      toast.success(`${promptType === "reinforcement" ? "Reinforcement" : "Refinement"} feedback generated!`);
    } catch (error: unknown) {
      console.error("Failed to generate AI feedback:", error);
      
      if (error instanceof Error && error.message?.includes("AI usage limit exceeded")) {
        toast.error("You&apos;ve reached your monthly AI generation limit. Upgrade to Pro for unlimited access.", {
          duration: 5000,
          action: {
            label: "Upgrade",
            onClick: () => {
              // TODO: Implement upgrade flow
              console.log("Navigate to upgrade page");
            },
          },
        });
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
  const isPro = usageInfo?.subscriptionPlan === "pro";

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Feedback Generator
          </CardTitle>
          <AIUsageBadge />
        </div>
        <CardDescription>
          Generate {promptType === "reinforcement" ? "reinforcement" : "refinement"} feedback for{" "}
          <span className="font-medium">{indicator.indicator_name}</span> ({indicator.indicator_code})
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
                promptType === "reinforcement" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {promptType === "reinforcement" ? "Reinforcement" : "Refinement"} Feedback
                </>
              )}
            </Button>

            {!canGenerate && !isPro && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Limit reached
              </Badge>
            )}
          </div>

          {!canGenerate && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 dark:text-amber-200 font-medium">
                    AI Generation Limit Reached
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    You&apos;ve used all {usageInfo?.limit} AI generations for this month. 
                    Upgrade to Pro for unlimited AI generations and advanced features.
                  </p>
                  <Button size="sm" className="mt-2 bg-purple-600 hover:bg-purple-700">
                    <Crown className="w-3 h-3 mr-1" />
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
                <Label className="text-sm font-medium">Generated Feedback</Label>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    promptType === "reinforcement" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  )}
                >
                  {promptType === "reinforcement" ? "Reinforcement" : "Refinement"}
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
              <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                  Upgrade to Pro for unlimited AI generations
                </p>
                <p className="text-purple-700 dark:text-purple-300 mt-1">
                  Get unlimited AI feedback generation, advanced features, and priority support.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 