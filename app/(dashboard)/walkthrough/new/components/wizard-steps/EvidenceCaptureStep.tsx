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
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { WalkthroughFormData } from "@/app/(dashboard)/walkthrough/new/validation";
import { useState, useEffect } from "react";

interface EvidenceCaptureStepProps {
  isLast: boolean;
  canProceed: boolean;
}

const EVIDENCE_PROMPTS = [
  "What specific teaching strategies did you observe?",
  "How were students engaged in the learning process?",
  "What evidence of student understanding did you see?",
  "How did the teacher differentiate instruction?",
  "What classroom management strategies were effective?",
];

export function EvidenceCaptureStep({}: EvidenceCaptureStepProps) {
  const methods = useFormContext<WalkthroughFormData>();
  const [wordCount, setWordCount] = useState(0);

  const evidenceValue = methods.watch("evidenceSummary");

  useEffect(() => {
    const words = evidenceValue?.trim().split(/\s+/).filter(Boolean).length || 0;
    setWordCount(words);
  }, [evidenceValue]);

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Evidence Collection Tips</h4>
              <p className="text-sm text-blue-700 mt-1">
                Document specific, observable behaviors and practices. Focus on what you saw and heard during the observation.
              </p>
              <div className="mt-3">
                <h5 className="text-sm font-medium text-blue-900 mb-1">Consider these questions:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  {EVIDENCE_PROMPTS.map((prompt, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-400 mt-1">•</span>
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormField
        control={methods.control}
        name="evidenceSummary"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg">
              Evidence Summary
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({wordCount} words)
              </span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe what you observed during the walkthrough. Be specific and objective in your notes..."
                className="min-h-[200px] text-base"
                maxLength={2000}
              />
            </FormControl>
            <FormMessage />
            <p className="text-sm text-muted-foreground">
              Minimum 10 words required. Maximum 2000 characters.
            </p>
          </FormItem>
        )}
      />
    </div>
  );
}