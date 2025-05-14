"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AIFeedbackReviewStep() {
  const { watch, setValue } = useFormContext();
  const evidenceSummary: string = watch("evidenceSummary");
  const reinforcementIndicator: string = watch("reinforcementIndicator") || "";
  const refinementIndicator: string = watch("refinementIndicator") || "";
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const generateWalkthroughFeedback = useAction(api.aiFeedback.generateWalkthroughFeedback);
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);

  // Fetch indicator details from Convex rubric query
  function getIndicatorDetails(code: string): { indicatorAcronym: string; indicatorName: string; overview: string } {
    if (!rubricData) return { indicatorAcronym: code, indicatorName: code, overview: "" };
    for (const domain of rubricData.domains) {
      for (const indicator of domain.indicators) {
        if (indicator.indicator_code === code) {
          return {
            indicatorAcronym: indicator.indicator_code,
            indicatorName: indicator.indicator_name,
            overview: indicator.overview || "",
          };
        }
      }
    }
    return { indicatorAcronym: code, indicatorName: code, overview: "" };
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
          const result = await generateWalkthroughFeedback({
            reinforcementIndicator: reinforcement,
            refinementIndicator: refinement,
            evidenceSummary,
          });
          if (!cancelled) {
            setFeedback(result);
            setValue("aiFeedbackSummary", result); // Store in form context for submission
          }
        }
      } catch (e) {
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
  function handleEdit(value: string) {
    setFeedback(value);
    setValue("aiFeedbackSummary", value);
  }

  if (!reinforcementIndicator || !refinementIndicator) {
    return <div className="text-center text-muted-foreground py-8">Please select both a reinforcement and a refinement indicator.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Feedback Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !feedback ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Generating feedback...</span>
            </div>
          ) : (
            <Textarea
              className="min-h-[120px]"
              value={feedback}
              onChange={(e) => handleEdit(e.target.value)}
              placeholder="AI-generated feedback will appear here. You can edit before submitting."
            />
          )}
        </CardContent>
      </Card>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
} 