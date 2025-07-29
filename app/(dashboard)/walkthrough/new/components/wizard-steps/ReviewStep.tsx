"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Send,
  Loader2,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { WalkthroughFormData } from "../WalkthroughWizard";
import { walkthroughFinalSchema } from "@/convex/validation/walkthroughFinalSchema";
import { useCanCreateWalkthrough } from "@/hooks/usageEnforcer";

interface Teacher {
  _id: string;
  name: string;
  email?: string;
  department?: string;
  gradeLevel?: string;
}

interface Indicator {
  indicator_code: string;
  indicator_name: string;
  domain?: string;
}

interface ReviewStepProps {
  formData: WalkthroughFormData;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
}

export function ReviewStep({ onPrevious }: ReviewStepProps) {
  const methods = useFormContext<WalkthroughFormData>();
  const router = useRouter();
  const { toast } = useToast();
  const { has } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usage enforcement
  const { allowed: canCreateWalkthrough, reason: walkthroughBlockReason } =
    useCanCreateWalkthrough();

  // Data queries
  const teachers = (useQuery(api.teachers.list) ?? []) as Teacher[];
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  const indicators: Indicator[] = rubricData
    ? rubricData.domains.flatMap(
        (domain: { indicators: Indicator[] }) => domain.indicators,
      )
    : [];

  // Mutations
  const createWalkthrough = useMutation(
    api.walkthroughs.createWalkthroughAndEntries,
  );

  // Form data
  const formData = methods.getValues();
  const selectedTeacher = teachers.find((t) => t._id === formData.teacherId);
  const reinforcementIndicator = indicators.find(
    (i) => i.indicator_code === formData.reinforcementIndicator,
  );
  const refinementIndicator = indicators.find(
    (i) => i.indicator_code === formData.refinementIndicator,
  );
  const walkthroughEntries = formData.walkthroughEntries || [];
  const reinforcementFeedback =
    walkthroughEntries.find((e) => e.type === "reinforcement")?.aiFeedback ||
    "";
  const refinementFeedback =
    walkthroughEntries.find((e) => e.type === "refinement")?.aiFeedback || "";

  // Submit handler
  const handleSubmit = async () => {
    // Usage limit check
    if (!canCreateWalkthrough) {
      toast({
        title: "Walkthrough Limit Reached",
        description:
          walkthroughBlockReason ||
          "You have reached your monthly walkthrough limit. Upgrade to Coach Pro for more.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Set status to completed
      methods.setValue("status", "completed");
      await methods.trigger(); // Ensure freshest form state

      const data = methods.getValues();
      const walkthroughDate =
        data.walkthroughDate instanceof Date
          ? data.walkthroughDate.getTime()
          : Number(data.walkthroughDate);

      const entries = methods.getValues("walkthroughEntries");

      // Final validation
      const finalValidation = walkthroughFinalSchema.safeParse({
        ...data,
        status: "completed",
        walkthroughEntries: entries,
        walkthroughDate,
      });

      if (!finalValidation.success) {
        toast({
          title: "Validation Error",
          description: finalValidation.error.errors
            .map((e: { message: string }) => e.message)
            .join(", "),
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

      // Create walkthrough
      await createWalkthrough({
        teacherId: data.teacherId as Id<"teachers">,
        walkthroughDate,
        status: "completed",
        reinforcementIndicator: data.reinforcementIndicator,
        refinementIndicator: data.refinementIndicator,
        evidenceSummary: data.evidenceSummary,
        walkthroughEntries: entries,
        hasProPlan,
        hasStarterPlan,
      });

      toast({
        title: "Success!",
        description: "Walkthrough submitted successfully",
        variant: "success",
      });

      router.push("/dashboard");
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit walkthrough. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation check
  const isComplete =
    selectedTeacher &&
    reinforcementIndicator &&
    refinementIndicator &&
    formData.evidenceSummary?.trim() &&
    reinforcementFeedback &&
    refinementFeedback;

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <div
        className={`rounded-lg p-4 ${
          isComplete
            ? "bg-green-50 border border-green-200"
            : "bg-yellow-50 border border-yellow-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="text-sm">
            <p
              className={`font-medium mb-1 ${
                isComplete ? "text-green-900" : "text-yellow-900"
              }`}
            >
              {isComplete ? "Ready to Submit" : "Incomplete Information"}
            </p>
            <p className={isComplete ? "text-green-700" : "text-yellow-700"}>
              {isComplete
                ? "All required information has been completed. Review the details below and submit your walkthrough."
                : "Please complete all previous steps before submitting."}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Teacher
              </p>
              <p className="font-medium">
                {selectedTeacher?.name || "Not selected"}
              </p>
              {selectedTeacher?.department && (
                <p className="text-sm text-muted-foreground">
                  {selectedTeacher.department}
                  {selectedTeacher.gradeLevel &&
                    ` • ${selectedTeacher.gradeLevel}`}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formData.walkthroughDate instanceof Date
                  ? formData.walkthroughDate.toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selected Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  Reinforcement
                </Badge>
              </div>
              <p className="font-medium text-green-900">
                {reinforcementIndicator?.indicator_name || "Not selected"}
              </p>
              {reinforcementIndicator && (
                <p className="text-sm text-green-700 mt-1">
                  {reinforcementIndicator.indicator_code}
                  {reinforcementIndicator.domain &&
                    ` • ${reinforcementIndicator.domain}`}
                </p>
              )}
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700"
                >
                  Refinement
                </Badge>
              </div>
              <p className="font-medium text-orange-900">
                {refinementIndicator?.indicator_name || "Not selected"}
              </p>
              {refinementIndicator && (
                <p className="text-sm text-orange-700 mt-1">
                  {refinementIndicator.indicator_code}
                  {refinementIndicator.domain &&
                    ` • ${refinementIndicator.domain}`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Evidence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg max-h-40 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">
              {formData.evidenceSummary || "No evidence provided"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formData.evidenceSummary?.length || 0} characters
          </p>
        </CardContent>
      </Card>

      {/* AI Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reinforcement Feedback */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Reinforcement Feedback
              </Badge>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 max-h-32 overflow-y-auto">
              <p className="text-sm text-green-900 whitespace-pre-wrap">
                {reinforcementFeedback || "No feedback generated"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Refinement Feedback */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700"
              >
                Refinement Feedback
              </Badge>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 max-h-32 overflow-y-auto">
              <p className="text-sm text-orange-900 whitespace-pre-wrap">
                {refinementFeedback || "No feedback generated"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Warning */}
      {!canCreateWalkthrough && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">
                  Walkthrough Limit Reached
                </p>
                <p className="text-destructive/80">
                  {walkthroughBlockReason ||
                    "You have reached your monthly walkthrough limit."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="pt-6">
        {/* Mobile navigation hint */}
        <div className="md:hidden text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {isComplete && canCreateWalkthrough
              ? "Ready to submit your walkthrough"
              : "Complete all steps to submit"}
          </p>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            size="lg"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isComplete || !canCreateWalkthrough || isSubmitting}
            size="lg"
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Walkthrough
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile submit button */}
      <div className="md:hidden">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || !canCreateWalkthrough || isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Walkthrough
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
