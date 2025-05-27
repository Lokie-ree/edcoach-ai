"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { walkthroughSchema } from "../app/(app)/walkthrough/new/validation"; // Adjust path as needed
import { z } from "zod";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useState, useEffect, useRef, useMemo } from "react";
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
import { walkthroughDraftSchema } from "@/convex/validation/walkthroughDraftSchema";
import { walkthroughFinalSchema } from "@/convex/validation/walkthroughFinalSchema";

// Types
export type WalkthroughFormData = z.infer<typeof walkthroughSchema>;

// Explicit types for teachers and indicators (Consider using Convex Doc types if available)
interface Teacher {
  _id: Id<"teachers">; // Assuming _id is the Convex Id
  name: string;
  email?: string;
  department?: string;
  gradeLevel?: string;
  status?: string;
  createdBy: string; // Or Id<"users">
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

export function WalkthroughForm({ walkthroughId }: { walkthroughId?: Id<"walkthroughs"> }) {
  const methods = useForm<WalkthroughFormData>({
    resolver: zodResolver(walkthroughSchema),
    defaultValues: {
      type: "walkthrough",
      teacherId: "",
      walkthroughDate: new Date(),
      status: "completed", // Default for new, will be overridden by draft or explicit set
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
  const { handleSubmit, setValue, watch, formState: { isSubmitting }, reset, control, getValues, trigger } = methods;

  const createWalkthrough = useMutation(api.walkthroughs.createWalkthroughAndEntries);
  const updateWalkthrough = useMutation(api.walkthroughs.updateWalkthroughAndEntries);
  const generateFeedbackAction = useAction(api.aiFeedback.generateFeedback);

  const router = useRouter();
  const { toast } = useToast();
  const [aiLoading, setAILoading] = useState(false);
  const lastResetId = useRef<Id<"walkthroughs"> | undefined>(undefined);

  // Fetch teachers
  const rawTeachers = useQuery(api.teachers.list);
  const teachers: Teacher[] = useMemo(() => (rawTeachers ?? []) as Teacher[], [rawTeachers]);

  // Fetch indicators
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  const indicators: Indicator[] = useMemo(() => {
    return rubricData
      ? rubricData.domains.flatMap((domain: { indicators: Indicator[] }) => domain.indicators)
      : [];
  }, [rubricData]);

  // Find indicator object by code
  const getIndicatorByCode = (code: string): Indicator | undefined => indicators.find((i) => i.indicator_code === code);

  // Fetch draft if editing
  const rawDrafts = useQuery(api.walkthroughs.listDraftWalkthroughs, walkthroughId ? {} : "skip") ?? [];
  const draft = useMemo(() => {
    return walkthroughId ? rawDrafts.find((w) => w._id === walkthroughId) : undefined;
  }, [rawDrafts, walkthroughId]);

  // Fetch walkthrough entries if editing a draft
  const shouldFetchEntries = !!(walkthroughId && draft);
  const rawWalkthroughEntries = useQuery(
    api.walkthroughEntries.listByWalkthrough,
    shouldFetchEntries && walkthroughId ? { walkthroughId } : "skip"
  );
  const walkthroughEntriesFromDB = useMemo(() => rawWalkthroughEntries ?? [], [rawWalkthroughEntries]);


  // Pre-fill form if editing a draft
  useEffect(() => {
    if (
      draft &&
      walkthroughId &&
      walkthroughEntriesFromDB.length === 2 && // Assuming a valid draft for editing must have 2 entries
      lastResetId.current !== walkthroughId
    ) {
      const reinforcementEntry = walkthroughEntriesFromDB.find((e: any) => e.type === "reinforcement");
      const refinementEntry = walkthroughEntriesFromDB.find((e: any) => e.type === "refinement");

      reset({
        type: draft.type || "walkthrough", // Ensure type is set
        teacherId: draft.teacherId,
        walkthroughDate: new Date(draft.walkthroughDate),
        status: draft.status, // This should be "draft"
        evidenceSummary: draft.evidenceSummary || "",
        reinforcementIndicator: reinforcementEntry?.indicatorAcronym || draft.reinforcementIndicator || "",
        refinementIndicator: refinementEntry?.indicatorAcronym || draft.refinementIndicator || "",
        walkthroughEntries: [
          {
            indicatorAcronym: reinforcementEntry?.indicatorAcronym || draft.reinforcementIndicator || "",
            type: "reinforcement" as const,
            aiFeedback: reinforcementEntry?.aiFeedback || "",
          },
          {
            indicatorAcronym: refinementEntry?.indicatorAcronym || draft.refinementIndicator || "",
            type: "refinement" as const,
            aiFeedback: refinementEntry?.aiFeedback || "",
          },
        ],
      });
      lastResetId.current = walkthroughId;
    }
  }, [draft, walkthroughEntriesFromDB, walkthroughId, reset]);


  const normalizeIndicatorValue = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") {
      return Object.values(val).map(v => String(v ?? "")).join(", ");
    }
    return String(val);
  };

  const handleAIFeedback = async () => {
    setAILoading(true);
    try {
      const evidence = watch("evidenceSummary") || "";
      const { reinforcementIndicator: rCode, refinementIndicator: refCode } = getValues();

      const getIndicatorPayload = (code: string) => {
        const indicator = getIndicatorByCode(code);
        if (!indicator) return null;
        return {
          indicator_name: indicator.indicator_name,
          indicator_code: indicator.indicator_code,
          overview: normalizeIndicatorValue(indicator.overview),
          key_terms: normalizeIndicatorValue(indicator.key_terms),
          effective_practice: normalizeIndicatorValue(indicator.effective_practice),
          development_evidence: normalizeIndicatorValue(indicator.development_evidence),
          student_centered_evidence: normalizeIndicatorValue(indicator.student_centered_evidence),
        };
      };

      const reinforcementIndicatorPayload = getIndicatorPayload(rCode);
      const refinementIndicatorPayload = getIndicatorPayload(refCode);

      if (!reinforcementIndicatorPayload || !refinementIndicatorPayload) {
        toast({ title: "Error", description: "Please select both reinforcement and refinement indicators.", variant: "destructive" });
        setAILoading(false);
        return;
      }

      const [reinforcement, refinement] = await Promise.all([
        generateFeedbackAction({ evidence, indicator: reinforcementIndicatorPayload, promptType: "reinforcement" }),
        generateFeedbackAction({ evidence, indicator: refinementIndicatorPayload, promptType: "refinement" }),
      ]);

      setValue("walkthroughEntries", [
        { indicatorAcronym: rCode, type: "reinforcement" as const, aiFeedback: reinforcement },
        { indicatorAcronym: refCode, type: "refinement" as const, aiFeedback: refinement },
      ]);
    } catch (error) {
      console.error("AI Feedback generation error:", error);
      toast({ title: "Error", description: "Failed to generate AI feedback.", variant: "destructive" });
    } finally {
      setAILoading(false);
    }
  };

  const handleFeedbackChange = (type: "reinforcement" | "refinement", value: string) => {
    const currentEntries = getValues("walkthroughEntries") || [];
    type FormEntry = WalkthroughFormData['walkthroughEntries'][number];
    const updatedEntries = currentEntries.map((entry: FormEntry) =>
      entry.type === type
        ? { ...entry, aiFeedback: value } // type is already correct
        : entry
    );
    setValue("walkthroughEntries", updatedEntries);
  };

  const _handleFormSubmission = async (
    data: WalkthroughFormData,
    targetStatus: "draft" | "completed"
  ) => {
    try {
      setValue("status", targetStatus);
      await trigger(); // Validate all fields based on the main schema and current values

      const currentWalkthroughEntries = getValues("walkthroughEntries");
      const walkthroughDateMs = data.walkthroughDate instanceof Date
        ? data.walkthroughDate.getTime()
        : Number(data.walkthroughDate);

      const submissionPayload = {
        ...data, // Includes teacherId, evidenceSummary, reinforcement/refinementIndicator from form
        status: targetStatus,
        walkthroughEntries: currentWalkthroughEntries,
        walkthroughDate: walkthroughDateMs,
      };

      const validationSchema = targetStatus === "draft" ? walkthroughDraftSchema : walkthroughFinalSchema;
      const validationResult = validationSchema.safeParse(submissionPayload);

      if (!validationResult.success) {
        toast({
          title: "Validation Error",
          description: validationResult.error.errors.map((e) => e.message).join("\n"),
          variant: "destructive",
        });
        return;
      }

      const apiPayload = {
        teacherId: validationResult.data.teacherId as Id<"teachers">, // Ensure type is correct for API
        walkthroughDate: validationResult.data.walkthroughDate, // Already a number
        status: validationResult.data.status,
        reinforcementIndicator: validationResult.data.reinforcementIndicator,
        refinementIndicator: validationResult.data.refinementIndicator,
        evidenceSummary: validationResult.data.evidenceSummary,
        walkthroughEntries: validationResult.data.walkthroughEntries,
      };

      if (walkthroughId && draft) { // Editing existing
        await updateWalkthrough({ walkthroughId, ...apiPayload });
      } else { // Creating new
        await createWalkthrough(apiPayload);
      }

      toast({
        title: targetStatus === "draft" ? "Draft Saved" : "Success",
        description: targetStatus === "draft"
          ? "You can resume this walkthrough later."
          : `Walkthrough ${walkthroughId ? 'updated' : 'created'} successfully.`,
        variant: "success",
      });
      router.push("/dashboard");

    } catch (error) {
      console.error(`Failed to ${targetStatus === "draft" ? "save draft" : "submit walkthrough"}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${targetStatus === "draft" ? "save draft" : "submit walkthrough"}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const onSaveDraft = (data: WalkthroughFormData) => _handleFormSubmission(data, "draft");
  const onSubmitFinal = (data: WalkthroughFormData) => _handleFormSubmission(data, "completed");

  const watchedEntries = watch("walkthroughEntries") || [];
  const reinforcementFeedbackEntry = watchedEntries.find(e => e.type === "reinforcement");
  const refinementFeedbackEntry = watchedEntries.find(e => e.type === "refinement");

  return (
    <FormProvider {...methods}>
      <Form {...methods}> {/* Pass methods to Form for ShadCN UI compatibility */}
        <form onSubmit={handleSubmit(onSubmitFinal)}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{walkthroughId && draft ? "Edit Walkthrough Draft" : "New Walkthrough"}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Section 1: Teacher, Date */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={teachers.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachers.length === 0 ? (
                              <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                            ) : (
                              teachers.map((teacher) => (
                                <SelectItem key={teacher._id} value={teacher._id}>
                                  {teacher.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="walkthroughDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <CalendarInput
                            date={field.value instanceof Date ? field.value : new Date(field.value)}
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
                    control={control}
                    name="reinforcementIndicator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reinforcement Indicator</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Also update the indicatorAcronym in walkthroughEntries
                            const currentEntries = getValues("walkthroughEntries");
                            setValue("walkthroughEntries", currentEntries.map(e => e.type === "reinforcement" ? {...e, indicatorAcronym: value} : e));
                          }}
                          disabled={indicators.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an indicator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {indicators.length === 0 ? (
                              <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                            ) : (
                              indicators.map((indicator) => (
                                <SelectItem key={indicator.indicator_code} value={indicator.indicator_code}>
                                  {indicator.indicator_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="refinementIndicator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refinement Indicator</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            const currentEntries = getValues("walkthroughEntries");
                            setValue("walkthroughEntries", currentEntries.map(e => e.type === "refinement" ? {...e, indicatorAcronym: value} : e));
                          }}
                          disabled={indicators.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an indicator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {indicators.length === 0 ? (
                              <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                            ) : (
                              indicators.map((indicator) => (
                                <SelectItem key={indicator.indicator_code} value={indicator.indicator_code}>
                                  {indicator.indicator_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={control}
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

              {/* AI Feedback Display */}
              {(reinforcementFeedbackEntry?.aiFeedback || refinementFeedbackEntry?.aiFeedback) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Card className="bg-muted/50">
                    <CardHeader><CardTitle className="text-base">Reinforcement Feedback</CardTitle></CardHeader>
                    <CardContent>
                      <Textarea
                        value={reinforcementFeedbackEntry?.aiFeedback || ""}
                        onChange={e => handleFeedbackChange("reinforcement", e.target.value)}
                        rows={4}
                        className="w-full"
                        placeholder="AI-generated reinforcement feedback..."
                      />
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader><CardTitle className="text-base">Refinement Feedback</CardTitle></CardHeader>
                    <CardContent>
                      <Textarea
                        value={refinementFeedbackEntry?.aiFeedback || ""}
                        onChange={e => handleFeedbackChange("refinement", e.target.value)}
                        rows={4}
                        className="w-full"
                        placeholder="AI-generated refinement feedback..."
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAIFeedback}
                  disabled={aiLoading || isSubmitting}
                >
                  {aiLoading ? "Generating..." : "Generate AI Feedback"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit(onSaveDraft)} // Use RHF handleSubmit to ensure validation
                  disabled={isSubmitting || aiLoading}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit" // This is for onSubmitFinal
                  disabled={
                    isSubmitting ||
                    aiLoading ||
                    !reinforcementFeedbackEntry?.aiFeedback || // Require AI feedback for final submit
                    !refinementFeedbackEntry?.aiFeedback
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}