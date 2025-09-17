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
import { ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

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
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className={cn(ICONS.semantic.header, "text-muted-foreground mt-0.5 flex-shrink-0")} />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground break-words">Evidence Collection Tips</h4>
              <p className="text-sm text-muted-foreground mt-1 break-words">
                Document specific, observable behaviors and practices. Focus on what you saw and heard during the observation.
              </p>
              <div className="mt-3">
                <h5 className="text-sm font-medium text-foreground mb-1 break-words">Consider these questions:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {EVIDENCE_PROMPTS.map((prompt, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-muted-foreground mt-1 flex-shrink-0">•</span>
                      <span className="break-words">{prompt}</span>
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
            <FormLabel className="text-base break-words">
              Evidence Summary
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({wordCount} words)
              </span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe what you observed during the walkthrough. Be specific and objective in your notes..."
                className="min-h-[200px] text-base break-words"
                maxLength={2000}
              />
            </FormControl>
            <FormMessage />
            <p className="text-sm text-muted-foreground break-words">
              Minimum 10 words required. Maximum 2000 characters.
            </p>
          </FormItem>
        )}
      />
    </div>
  );
}