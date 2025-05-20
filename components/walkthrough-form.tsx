"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { walkthroughSchema } from "../app/(app)/walkthrough/new/validation";
import { z } from "zod";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CalendarInput } from "@/components/ui/calendar-input";

// Types
export type WalkthroughFormData = z.infer<typeof walkthroughSchema>;

// Explicit types for teachers and indicators
interface Teacher {
  _id: string;
  name: string;
  email?: string;
  department?: string;
  gradeLevel?: string;
  status?: string;
  createdBy: string;
  createdAt: number;
  organization?: string;
}

interface Indicator {
  indicator_code: string;
  indicator_name: string;
  overview?: string | string[] | Record<string, string>;
  key_terms?: string | string[] | Record<string, string>;
  effective_practice?: string | string[] | Record<string, string>;
  development_evidence?: string | string[] | Record<string, string>;
  student_centered_evidence?: string | string[] | Record<string, string>;
}

export function WalkthroughForm() {
  const methods = useForm<WalkthroughFormData>({
    resolver: zodResolver(walkthroughSchema),
    defaultValues: {
      type: "walkthrough",
      teacherId: "",
      walkthroughDate: new Date(),
      status: "completed",
      evidenceSummary: "",
      reinforcementIndicator: "",
      refinementIndicator: "",
      walkthroughEntries: [
        { indicatorAcronym: "", type: "reinforcement", aiFeedback: "" },
        { indicatorAcronym: "", type: "refinement", aiFeedback: "" },
      ],
    },
    mode: "onChange",
  });
  const { handleSubmit, setValue, watch, formState: { isSubmitting } } = methods;
  const createWalkthrough = useMutation(api.walkthroughs.createWalkthroughAndEntries);
  const router = useRouter();
  const { toast } = useToast();
  const [aiFeedback, setAIFeedback] = useState({ reinforcement: "", refinement: "" });
  const [aiLoading, setAILoading] = useState(false);

  // Fetch teachers and indicators
  const teachers = (useQuery(api.teachers.list) ?? []) as Teacher[];
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  const indicators: Indicator[] = rubricData
    ? rubricData.domains.flatMap((domain: { indicators: Indicator[] }) => domain.indicators)
    : [];

  // Find indicator object by code
  const getIndicatorByCode = (code: string): Indicator | undefined => indicators.find((i) => i.indicator_code === code);

  // Real AI feedback logic
  const generateFeedback = useAction(api.aiFeedback.generateFeedback);
  const handleAIFeedback = async () => {
    setAILoading(true);
    setAIFeedback({ reinforcement: "", refinement: "" });
    try {
      const evidence = watch("evidenceSummary") || "";
      const reinforcementCode = watch("reinforcementIndicator");
      const refinementCode = watch("refinementIndicator");
      const reinforcementIndicator = getIndicatorByCode(reinforcementCode);
      const refinementIndicator = getIndicatorByCode(refinementCode);
      if (!reinforcementIndicator || !refinementIndicator) {
        toast({ title: "Error", description: "Please select both indicators.", variant: "destructive" });
        setAILoading(false);
        return;
      }
      // Normalize all indicator fields to string
      const normalizeToString = (val: unknown): string => {
        if (Array.isArray(val)) return val.join(", ");
        if (typeof val === "object" && val !== null) return Object.values(val as Record<string, unknown>).join(", ");
        return (val as string) || "";
      };
      const [reinforcement, refinement] = await Promise.all([
        generateFeedback({
          evidence,
          indicator: {
            indicator_name: reinforcementIndicator.indicator_name,
            indicator_code: reinforcementIndicator.indicator_code,
            overview: normalizeToString(reinforcementIndicator.overview),
            key_terms: normalizeToString(reinforcementIndicator.key_terms),
            effective_practice: normalizeToString(reinforcementIndicator.effective_practice),
            development_evidence: normalizeToString(reinforcementIndicator.development_evidence),
            student_centered_evidence: normalizeToString(reinforcementIndicator.student_centered_evidence),
          },
          promptType: "reinforcement",
        }),
        generateFeedback({
          evidence,
          indicator: {
            indicator_name: refinementIndicator.indicator_name,
            indicator_code: refinementIndicator.indicator_code,
            overview: normalizeToString(refinementIndicator.overview),
            key_terms: normalizeToString(refinementIndicator.key_terms),
            effective_practice: normalizeToString(refinementIndicator.effective_practice),
            development_evidence: normalizeToString(refinementIndicator.development_evidence),
            student_centered_evidence: normalizeToString(refinementIndicator.student_centered_evidence),
          },
          promptType: "refinement",
        }),
      ]);
      setAIFeedback({ reinforcement, refinement });
      setValue("walkthroughEntries", [
        { indicatorAcronym: reinforcementCode, type: "reinforcement", aiFeedback: reinforcement },
        { indicatorAcronym: refinementCode, type: "refinement", aiFeedback: refinement },
      ]);
    } catch {
      toast({ title: "Error", description: "Failed to generate AI feedback.", variant: "destructive" });
    } finally {
      setAILoading(false);
    }
  };

  // Handler for editable feedback textareas
  const handleFeedbackChange = (type: "reinforcement" | "refinement", value: string) => {
    setAIFeedback((prev) => ({ ...prev, [type]: value }));
    // Also update walkthroughEntries in the form state
    const entries = methods.getValues("walkthroughEntries") || [];
    type Entry = WalkthroughFormData['walkthroughEntries'][number];
    const updatedEntries = entries.map((entry: Entry) =>
      entry.type === type ? { ...entry, aiFeedback: value } : entry
    );
    methods.setValue("walkthroughEntries", updatedEntries);
  };

  const onSubmit = async (data: WalkthroughFormData) => {
    try {
      // Convert date to timestamp
      const walkthroughDate = typeof data.walkthroughDate === "object" && data.walkthroughDate instanceof Date
        ? data.walkthroughDate.getTime()
        : Number(data.walkthroughDate);
      await createWalkthrough({
        teacherId: data.teacherId as Id<"teachers">,
        walkthroughDate,
        status: data.status,
        reinforcementIndicator: data.reinforcementIndicator,
        refinementIndicator: data.refinementIndicator,
        evidenceSummary: data.evidenceSummary,
        walkthroughEntries: data.walkthroughEntries,
      });
      toast({
        title: "Success",
        description: "Walkthrough created successfully",
        variant: "success",
      });
      router.push("/dashboard");
    } catch {
      toast({
        title: "Error",
        description: "Failed to create walkthrough. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>New Walkthrough</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Section 1: Teacher, Date */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={methods.control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={teachers.length === 0}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.length === 0 ? (
                                <SelectItem value="__loading__" disabled>
                                  Loading...
                                </SelectItem>
                              ) : (
                                teachers.map((teacher: Teacher) => (
                                  <SelectItem key={teacher._id} value={teacher._id}>
                                    {teacher.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name="walkthroughDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <CalendarInput
                            date={field.value instanceof Date ? field.value : undefined}
                            setDate={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 2: Indicators, Evidence Notes */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={methods.control}
                    name="reinforcementIndicator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reinforcement Indicator</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={indicators.length === 0}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an indicator" />
                            </SelectTrigger>
                            <SelectContent>
                              {indicators.length === 0 ? (
                                <SelectItem value="__loading__" disabled>
                                  Loading...
                                </SelectItem>
                              ) : (
                                indicators.map((indicator: Indicator) => (
                                  <SelectItem key={indicator.indicator_code} value={indicator.indicator_code}>
                                    {indicator.indicator_name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name="refinementIndicator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refinement Indicator</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={indicators.length === 0}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an indicator" />
                            </SelectTrigger>
                            <SelectContent>
                              {indicators.length === 0 ? (
                                <SelectItem value="__loading__" disabled>
                                  Loading...
                                </SelectItem>
                              ) : (
                                indicators.map((indicator: Indicator) => (
                                  <SelectItem key={indicator.indicator_code} value={indicator.indicator_code}>
                                    {indicator.indicator_name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={methods.control}
                    name="evidenceSummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence Summary</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="w-full" rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* AI Feedback and Action Buttons */}
              {(aiFeedback.reinforcement || aiFeedback.refinement) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Reinforcement Card */}
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-base">Reinforcement Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={aiFeedback.reinforcement}
                        onChange={e => handleFeedbackChange("reinforcement", e.target.value)}
                        rows={4}
                        className="w-full"
                        placeholder="AI-generated reinforcement feedback will appear here."
                      />
                    </CardContent>
                  </Card>
                  {/* Refinement Card */}
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-base">Refinement Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={aiFeedback.refinement}
                        onChange={e => handleFeedbackChange("refinement", e.target.value)}
                        rows={4}
                        className="w-full"
                        placeholder="AI-generated refinement feedback will appear here."
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
              <div className="flex gap-4 mt-6">
                {!(aiFeedback.reinforcement && aiFeedback.refinement) ? (
                  <Button type="button" variant="secondary" onClick={handleAIFeedback} disabled={aiLoading}>
                    {aiLoading ? "Generating AI Feedback..." : "Generate AI Feedback"}
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || !(aiFeedback.reinforcement && aiFeedback.refinement)}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
} 