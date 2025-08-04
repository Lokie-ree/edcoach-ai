"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { WalkthroughFormData } from "@/app/(dashboard)/walkthrough/new/validation";
import { usePlanDetection } from "@/hooks/usePlanDetection";

interface AIFeedbackStepProps {
  isLast: boolean;
  canProceed: boolean;
}

export function AIFeedbackStep({ isLast }: AIFeedbackStepProps) {
  const methods = useFormContext<WalkthroughFormData>();
  const { toast } = useToast();
  const { isProPlan, isStarterPlan } = usePlanDetection();
  
  const [reinforcementFeedback, setReinforcementFeedback] = useState("");
  const [refinementFeedback, setRefinementFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateAIFeedback = useAction(api.aiFeedback.generateFeedback);
  const indicators = useQuery(api.rubricIndicators.getAllIndicators);

  const formData = methods.getValues();
  
  const reinforcementIndicator = indicators?.find(
    i => i.indicator_code === formData.reinforcementIndicator
  );
  const refinementIndicator = indicators?.find(
    i => i.indicator_code === formData.refinementIndicator
  );

  const handleGenerateFeedback = async () => {
    if (!formData.evidenceSummary || !formData.reinforcementIndicator || !formData.refinementIndicator) {
      toast({
        title: "Missing Information",
        description: "Please complete all previous steps before generating feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAIFeedback({
        evidenceSummary: formData.evidenceSummary,
        reinforcementIndicator: formData.reinforcementIndicator,
        refinementIndicator: formData.refinementIndicator,
        hasProPlan: isProPlan,
        hasStarterPlan: isStarterPlan,
      });

      setReinforcementFeedback(result.reinforcementFeedback);
      setRefinementFeedback(result.refinementFeedback);
      setHasGenerated(true);
      
      // Update the form with the generated feedback
      methods.setValue("reinforcementFeedback", result.reinforcementFeedback);
      methods.setValue("refinementFeedback", result.refinementFeedback);

      toast({
        title: "Feedback Generated!",
        description: "AI feedback has been generated. You can edit it before submitting.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate feedback",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card className="border-slate-200 bg-slate-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Walkthrough Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Reinforcement</h4>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {formData.reinforcementIndicator}
              </Badge>
              {reinforcementIndicator && (
                <p className="text-sm text-muted-foreground mt-1">
                  {reinforcementIndicator.indicator_name}
                </p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Refinement</h4>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {formData.refinementIndicator}
              </Badge>
              {refinementIndicator && (
                <p className="text-sm text-muted-foreground mt-1">
                  {refinementIndicator.indicator_name}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Evidence Summary</h4>
            <p className="text-sm text-muted-foreground border-l-2 border-slate-300 pl-3">
              {formData.evidenceSummary.substring(0, 200)}
              {formData.evidenceSummary.length > 200 && "..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Feedback Generation */}
      {!hasGenerated ? (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Generate AI Feedback
            </h3>
            <p className="text-purple-700 mb-4">
              Generate personalized feedback based on your evidence and selected indicators.
            </p>
            <Button
              onClick={handleGenerateFeedback}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Reinforcement Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Reinforcement
                  </Badge>
                  Feedback
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateFeedback}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reinforcementFeedback}
                onChange={(e) => {
                  setReinforcementFeedback(e.target.value);
                  methods.setValue("reinforcementFeedback", e.target.value);
                }}
                className="min-h-[120px]"
                placeholder="AI-generated reinforcement feedback will appear here..."
              />
            </CardContent>
          </Card>

          {/* Refinement Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Refinement
                  </Badge>
                  Feedback
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateFeedback}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={refinementFeedback}
                onChange={(e) => {
                  setRefinementFeedback(e.target.value);
                  methods.setValue("refinementFeedback", e.target.value);
                }}
                className="min-h-[120px]"
                placeholder="AI-generated refinement feedback will appear here..."
              />
            </CardContent>
          </Card>

          {isLast && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Ready to Submit</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Review your feedback above and click &quot;Submit Walkthrough&quot; when you&apos;re ready to send it to the teacher.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}