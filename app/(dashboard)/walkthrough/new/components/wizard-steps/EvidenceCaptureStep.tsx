"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Lightbulb, Clock } from "lucide-react";
import { WalkthroughFormData } from "../WalkthroughWizard";
import { useState, useEffect } from "react";

interface EvidenceCaptureStepProps {
  formData: WalkthroughFormData;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
}

const EVIDENCE_PROMPTS = [
  "What specific teaching strategies did you observe?",
  "How were students engaged in the learning process?",
  "What evidence of student understanding did you see?",
  "How did the teacher differentiate instruction?",
  "What classroom management strategies were effective?",
  "How did the teacher use assessment to guide instruction?",
  "What opportunities for student collaboration were provided?",
  "How was technology integrated into the lesson?",
];

export function EvidenceCaptureStep({
  onNext,
  onPrevious,
  canProceed,
}: EvidenceCaptureStepProps) {
  const methods = useFormContext<WalkthroughFormData>();
  const [wordCount, setWordCount] = useState(0);
  const [focusPrompt, setFocusPrompt] = useState<string>("");

  const evidenceValue = methods.watch("evidenceSummary");

  useEffect(() => {
    const words =
      evidenceValue
        ?.trim()
        .split(/\s+/)
        .filter((word) => word.length > 0) || [];
    setWordCount(words.length);
  }, [evidenceValue]);

  useEffect(() => {
    // Rotate through prompts every 10 seconds
    const interval = setInterval(() => {
      setFocusPrompt(
        EVIDENCE_PROMPTS[Math.floor(Math.random() * EVIDENCE_PROMPTS.length)],
      );
    }, 10000);

    // Set initial prompt
    setFocusPrompt(
      EVIDENCE_PROMPTS[Math.floor(Math.random() * EVIDENCE_PROMPTS.length)],
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              Document Your Observations
            </p>
            <p className="text-blue-700">
              Record specific, objective evidence of what you observed in the
              classroom. Focus on concrete behaviors, interactions, and
              instructional practices.
            </p>
          </div>
        </div>
      </div>

      {/* Focus Prompt */}
      {focusPrompt && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Consider This
              </span>
            </div>
            <p className="text-sm text-purple-700 italic">{focusPrompt}</p>
          </CardContent>
        </Card>
      )}

      {/* Evidence Summary Input */}
      <FormField
        control={methods.control}
        name="evidenceSummary"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Evidence Summary
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe what you observed during the classroom visit. Be specific and objective. Include details about teaching strategies, student engagement, classroom environment, and any notable interactions or practices you witnessed..."
                className="min-h-[200px] md:min-h-[250px] text-base leading-relaxed resize-none"
                maxLength={2000}
              />
            </FormControl>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {wordCount} word{wordCount !== 1 ? "s" : ""}
                {wordCount > 0 && wordCount < 50 && (
                  <span className="text-orange-500 ml-1">
                    (Consider adding more detail)
                  </span>
                )}
              </span>
              <span>{field.value?.length || 0}/2000 characters</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Evidence Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-800 mb-2">
              Good Evidence Includes:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Specific observable behaviors</li>
              <li>• Direct quotes or interactions</li>
              <li>• Concrete teaching strategies used</li>
              <li>• Student responses and engagement levels</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-yellow-800 mb-2">
              Avoid Including:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Personal opinions or judgments</li>
              <li>• Assumptions about motivations</li>
              <li>• Evaluative language</li>
              <li>• Vague generalizations</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="pt-6">
        {/* Mobile navigation hint */}
        <div className="md:hidden text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {canProceed
              ? "Evidence captured - ready for AI feedback"
              : "Add your observations to continue"}
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
            disabled={!canProceed}
            size="lg"
            className="min-w-32"
          >
            Generate Feedback
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Character count warning */}
      {evidenceValue?.length > 1800 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-700">
            You&apos;re approaching the character limit. Consider being more
            concise while maintaining key details.
          </p>
        </div>
      )}
    </div>
  );
}
