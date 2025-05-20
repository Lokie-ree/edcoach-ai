"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type IndicatorContext = {
  indicator_code: string;
  indicator_name: string;
  overview?: string;
  key_terms?: string;
  effective_practice?: string;
  development_evidence?: string;
  student_centered_evidence?: string;
};

export function AIFeedbackReviewStep() {
  const { watch, setValue } = useFormContext();
  const evidenceSummary: string = watch("evidenceSummary");
  const reinforcementIndicator: string = watch("reinforcementIndicator") || "";
  const refinementIndicator: string = watch("refinementIndicator") || "";
  const [reinforcementFeedback, setReinforcementFeedback] = useState<string>("");
  const [refinementFeedback, setRefinementFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const generateSplitWalkthroughFeedback = useAction(api.aiFeedback.generateSplitWalkthroughFeedback);
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);

  // Fetch indicator details from Convex rubric query
  function getIndicatorDetails(code: string): IndicatorContext {
    if (!rubricData) return {
      indicator_code: code,
      indicator_name: code,
      overview: "",
      key_terms: "",
      effective_practice: "",
      development_evidence: "",
      student_centered_evidence: "",
    };
    for (const domain of rubricData.domains) {
      for (const indicator of domain.indicators) {
        if (indicator.indicator_code === code) {
          return {
            indicator_code: indicator.indicator_code,
            indicator_name: indicator.indicator_name,
            overview: indicator.overview || "",
            key_terms: Array.isArray(indicator.key_terms)
              ? indicator.key_terms.join(", ")
              : (indicator.key_terms || ""),
            effective_practice: indicator.effective_practice || "",
            development_evidence: indicator.development_evidence || "",
            student_centered_evidence: Array.isArray(indicator.student_centered_evidence)
              ? indicator.student_centered_evidence.join(", ")
              : (indicator.student_centered_evidence || ""),
          };
        }
      }
    }
    return {
      indicator_code: code,
      indicator_name: code,
      overview: "",
      key_terms: "",
      effective_practice: "",
      development_evidence: "",
      student_centered_evidence: "",
    };
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchFeedback() {
      setLoading(true);
      setError("");
      try {
        if (reinforcementIndicator && refinementIndicator && evidenceSummary) {
          const reinforcement = getIndicatorDetails(reinforcementIndicator);
          const refinement = getIndicatorDetails(refinementIndicator);
          const result = await generateSplitWalkthroughFeedback({
            reinforcementIndicator: reinforcement,
            refinementIndicator: refinement,
            evidenceSummary,
          });
          if (!cancelled) {
            setReinforcementFeedback(result.reinforcement);
            setRefinementFeedback(result.refinement);
            setValue("aiFeedbackReinforcement", result.reinforcement);
            setValue("aiFeedbackRefinement", result.refinement);
            setValue("aiFeedbackSummary", result.reinforcement + "\n\n" + result.refinement); // For backward compatibility
          }
        }
      } catch {
        setError("Failed to generate feedback. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (reinforcementIndicator && refinementIndicator && evidenceSummary) {
      fetchFeedback();
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reinforcementIndicator, refinementIndicator, evidenceSummary]);

  // Update form context on edit
  const handleReinforcementEdit = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReinforcementFeedback(event.target.value);
    setValue("aiFeedbackReinforcement", event.target.value);
  };
  const handleRefinementEdit = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRefinementFeedback(event.target.value);
    setValue("aiFeedbackRefinement", event.target.value);
  };

  if (!reinforcementIndicator || !refinementIndicator) {
    return <div className="text-center text-muted-foreground py-8">Please select both a reinforcement and a refinement indicator.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Feedback: Reinforcement</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !reinforcementFeedback ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Generating feedback...</span>
            </div>
          ) : (
            <Textarea
              className="min-h-[80px]"
              value={reinforcementFeedback}
              onChange={handleReinforcementEdit}
              placeholder="AI-generated reinforcement feedback will appear here. You can edit before submitting."
            />
          )}
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Feedback: Refinement</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !refinementFeedback ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Generating feedback...</span>
            </div>
          ) : (
            <Textarea
              className="min-h-[80px]"
              value={refinementFeedback}
              onChange={handleRefinementEdit}
              placeholder="AI-generated refinement feedback will appear here. You can edit before submitting."
            />
          )}
        </CardContent>
      </Card>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
} 