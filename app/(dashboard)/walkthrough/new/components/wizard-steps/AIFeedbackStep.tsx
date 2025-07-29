"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { WalkthroughFormData } from "../WalkthroughWizard";

interface Indicator {
  indicator_code: string;
  indicator_name: string;
  overview?: string | string[] | Record<string, string>;
  key_terms?: string | string[] | Record<string, string>;
  effective_practice?: string | string[] | Record<string, string>;
  development_evidence?: string | string[] | Record<string, string>;
  student_centered_evidence?: string | string[] | Record<string, string>;
  domain?: string;
}

interface AIFeedbackStepProps {
  formData: WalkthroughFormData;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
}

type WalkthroughEntry = {
  indicatorAcronym: string;
  type: "reinforcement" | "refinement";
  aiFeedback: string;
};

export function AIFeedbackStep({ onNext, onPrevious }: AIFeedbackStepProps) {
  const methods = useFormContext<WalkthroughFormData>();
  const { toast } = useToast();
  const { has } = useAuth();
  const [aiLoading, setAILoading] = useState(false);

  // Get rubric data
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  const indicators: Indicator[] = rubricData
    ? rubricData.domains.flatMap(
        (domain: { indicators: Indicator[] }) => domain.indicators,
      )
    : [];

  // Get form data
  const evidenceSummary = methods.watch("evidenceSummary");
  const teacherId = methods.watch("teacherId");
  const reinforcementIndicator = methods.watch("reinforcementIndicator");
  const refinementIndicator = methods.watch("refinementIndicator");
  const walkthroughEntries = methods.watch("walkthroughEntries") || [];

  // Find indicator object by code
  const getIndicatorByCode = (code: string): Indicator | undefined =>
    indicators.find((i) => i.indicator_code === code);

  // AI feedback generation
  const generateAIFeedback = useAction(api.aiFeedback.generateAIFeedback);

  const normalizeIndicatorField = (val: unknown): string => {
    if (!val) return "N/A";

    if (Array.isArray(val)) {
      return val.filter((item) => item && typeof item === "string").join("; ");
    }

    if (typeof val === "object" && val !== null) {
      const values = Object.values(val as Record<string, unknown>);
      return values
        .filter((item) => item && typeof item === "string")
        .join("; ");
    }

    return (val as string) || "N/A";
  };

  const handleGenerateAIFeedback = async () => {
    setAILoading(true);
    try {
      // Validation
      if (!evidenceSummary?.trim()) {
        toast({
          title: "Evidence Required",
          description:
            "Please provide evidence summary before generating AI feedback.",
          variant: "destructive",
        });
        return;
      }

      if (!teacherId) {
        toast({
          title: "Teacher Required",
          description: "Please select a teacher before generating AI feedback.",
          variant: "destructive",
        });
        return;
      }

      const reinforcementInd = getIndicatorByCode(reinforcementIndicator);
      const refinementInd = getIndicatorByCode(refinementIndicator);

      if (!reinforcementInd || !refinementInd) {
        toast({
          title: "Error",
          description: "Please select both indicators.",
          variant: "destructive",
        });
        return;
      }

      // Check subscription plans
      const hasProPlan =
        (has?.({ plan: "coach_pro" }) ?? false) ||
        (has?.({ permission: "coach_pro" }) ?? false) ||
        (has?.({ role: "coach_pro" }) ?? false);

      const hasStarterPlan = !hasProPlan;

      // Generate AI feedback
      const feedbackResult = (await generateAIFeedback({
        evidence: evidenceSummary,
        mode: "both",
        reinforcementIndicator: {
          indicator_name: reinforcementInd.indicator_name,
          indicator_code: reinforcementInd.indicator_code,
          domain: reinforcementInd.domain || "N/A",
          overview: normalizeIndicatorField(reinforcementInd.overview),
          key_terms: normalizeIndicatorField(reinforcementInd.key_terms),
          effective_practice: normalizeIndicatorField(
            reinforcementInd.effective_practice,
          ),
          development_evidence: normalizeIndicatorField(
            reinforcementInd.development_evidence,
          ),
          student_centered_evidence: normalizeIndicatorField(
            reinforcementInd.student_centered_evidence,
          ),
        },
        refinementIndicator: {
          indicator_name: refinementInd.indicator_name,
          indicator_code: refinementInd.indicator_code,
          domain: refinementInd.domain || "N/A",
          overview: normalizeIndicatorField(refinementInd.overview),
          key_terms: normalizeIndicatorField(refinementInd.key_terms),
          effective_practice: normalizeIndicatorField(
            refinementInd.effective_practice,
          ),
          development_evidence: normalizeIndicatorField(
            refinementInd.development_evidence,
          ),
          student_centered_evidence: normalizeIndicatorField(
            refinementInd.student_centered_evidence,
          ),
        },
        hasProPlan,
        hasStarterPlan,
        teacherId: teacherId as Id<"teachers">,
      })) as { reinforcement: string; refinement: string };

      // Update form with generated feedback
      methods.setValue("walkthroughEntries", [
        {
          indicatorAcronym: reinforcementIndicator,
          type: "reinforcement" as const,
          aiFeedback: feedbackResult.reinforcement,
        },
        {
          indicatorAcronym: refinementIndicator,
          type: "refinement" as const,
          aiFeedback: feedbackResult.refinement,
        },
      ]);

      toast({
        title: "Success",
        description: "AI feedback generated successfully!",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate AI feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAILoading(false);
    }
  };

  // Handler for editable feedback textareas
  const handleFeedbackChange = (
    type: "reinforcement" | "refinement",
    value: string,
  ) => {
    const entries = methods.getValues("walkthroughEntries") || [];
    const normalizedEntries: WalkthroughEntry[] = entries.map((entry) => ({
      ...entry,
      aiFeedback: entry.aiFeedback ?? "",
    }));
    const updatedEntries = normalizedEntries.map((entry) =>
      entry.type === type
        ? { ...entry, type: type as typeof entry.type, aiFeedback: value }
        : entry,
    );
    methods.setValue("walkthroughEntries", updatedEntries);
  };

  const reinforcementFeedback =
    walkthroughEntries.find((e) => e.type === "reinforcement")?.aiFeedback ||
    "";
  const refinementFeedback =
    walkthroughEntries.find((e) => e.type === "refinement")?.aiFeedback || "";
  const hasFeedback = reinforcementFeedback && refinementFeedback;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-purple-900 mb-1">
              AI-Powered Feedback Generation
            </p>
            <p className="text-purple-700">
              Generate professional feedback based on your evidence and selected
              indicators. You can edit and refine the feedback before
              submitting.
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      {!hasFeedback && (
        <div className="text-center py-8">
          <Button
            onClick={handleGenerateAIFeedback}
            disabled={aiLoading || !evidenceSummary?.trim()}
            size="lg"
            className="w-full md:w-auto"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating AI Feedback...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Feedback
              </>
            )}
          </Button>

          {!evidenceSummary?.trim() && (
            <p className="text-sm text-muted-foreground mt-2">
              Evidence summary is required to generate feedback
            </p>
          )}
        </div>
      )}

      {/* Generated Feedback */}
      {hasFeedback && (
        <div className="space-y-6">
          {/* Success indicator */}
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              AI Feedback Generated Successfully
            </span>
          </div>

          {/* Reinforcement Feedback */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Reinforcement Feedback
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  Strengths
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reinforcementFeedback}
                onChange={(e) =>
                  handleFeedbackChange("reinforcement", e.target.value)
                }
                rows={6}
                className="w-full bg-white border-green-300 focus:border-green-500 focus:ring-green-500"
                placeholder="AI-generated reinforcement feedback will appear here."
              />
            </CardContent>
          </Card>

          {/* Refinement Feedback */}
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Refinement Feedback
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700"
                >
                  Growth Area
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={refinementFeedback}
                onChange={(e) =>
                  handleFeedbackChange("refinement", e.target.value)
                }
                rows={6}
                className="w-full bg-white border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="AI-generated refinement feedback will appear here."
              />
            </CardContent>
          </Card>

          {/* Regenerate Option */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleGenerateAIFeedback}
              disabled={aiLoading}
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Feedback
            </Button>
          </div>
        </div>
      )}

      {/* Quality Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-2">
              Tips for Quality Feedback
            </p>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• Review the AI-generated feedback for accuracy and tone</li>
              <li>• Add specific examples from your observations if needed</li>
              <li>• Ensure feedback is constructive and actionable</li>
              <li>• Personalize the feedback to match your coaching style</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="pt-6">
        {/* Mobile navigation hint */}
        <div className="md:hidden text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {hasFeedback
              ? "Feedback ready - proceed to review"
              : "Generate feedback to continue"}
          </p>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex justify-between">
          <Button variant="outline" onClick={onPrevious} size="lg">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={!hasFeedback}
            size="lg"
            className="min-w-32"
          >
            Review & Submit
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
