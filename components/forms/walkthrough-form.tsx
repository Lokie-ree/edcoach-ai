"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser, useOrganization } from "@clerk/nextjs";
import { walkthroughSchema } from "@/app/walkthrough/new/validation";
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
import { walkthroughFinalSchema } from "@/convex/validation/walkthroughFinalSchema";
import { Sparkles } from "lucide-react";

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
  createdBy?: string;
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

// Add after Indicator interface
type WalkthroughEntry = {
  indicatorAcronym: string;
  type: "reinforcement" | "refinement";
  aiFeedback: string;
};

export function WalkthroughForm({ walkthroughId, coachId: propCoachId }: { walkthroughId?: Id<"walkthroughs">, coachId?: Id<"users">, onCancel?: () => void }) {
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
  const { handleSubmit, setValue, watch, formState: { isSubmitting }, reset } = methods;
  const createWalkthrough = useMutation(api.walkthroughs.createWalkthroughAndEntries);
  const updateWalkthrough = useMutation(api.walkthroughs.updateWalkthroughAndEntries);
  const router = useRouter();
  const { toast } = useToast();
  const [aiLoading, setAILoading] = useState(false);
  const lastResetId = useRef<Id<"walkthroughs"> | undefined>(undefined);
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);

  // Use propCoachId if provided, otherwise fetch current user
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    !propCoachId && user ? { clerkId: user.id } : "skip"
  );

  // Find the appropriate org ID (replace this with your actual org ID logic)
  const { organization } = useOrganization();
  const clerkOrganizationId = organization?.id;
  const teachers = (useQuery(api.teachers.list, clerkOrganizationId ? { clerkOrganizationId } : "skip") ?? []) as Teacher[];
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  const indicators: Indicator[] = rubricData
    ? rubricData.domains.flatMap((domain: { indicators: Indicator[] }) => domain.indicators)
    : [];

  // Find indicator object by code
  const getIndicatorByCode = (code: string): Indicator | undefined => indicators.find((i) => i.indicator_code === code);

  // Fetch draft if editing
  const drafts = useQuery(api.walkthroughs.listDraftWalkthroughs, {}) ?? [];
  const draft = walkthroughId ? drafts.find((w) => w._id === walkthroughId) : undefined;
  // Fetch walkthrough entries if editing
  const shouldFetchEntries = Boolean(walkthroughId && draft);
  const rawWalkthroughEntries = useQuery(
    api.walkthroughEntries.listByWalkthrough,
    shouldFetchEntries && walkthroughId ? { walkthroughId } : "skip"
  );

  // Wrap walkthroughEntries initialization in useMemo to fix dependency warning
  const walkthroughEntries = useMemo(() => rawWalkthroughEntries ?? [], [rawWalkthroughEntries]);

  // Move the logic inside useMemo to fix dependency warning
  const entryList = useMemo(() => {
    if (!walkthroughEntries) return [];
    
    return walkthroughEntries.map((entry) => ({
      indicatorAcronym: entry.indicatorAcronym ?? "",
      type: entry.type,
      aiFeedback: entry.aiFeedback ?? "",
    }));
  }, [walkthroughEntries]);

  // Then modify the useEffect to use entryList
  useEffect(() => {
    if (
      draft &&
      walkthroughId &&
      entryList.length === 2 &&
      lastResetId.current !== walkthroughId
    ) {
      const reinforcementEntry = entryList.find((e) => e.type === "reinforcement");
      const refinementEntry = entryList.find((e) => e.type === "refinement");

      reset({
        teacherId: draft.teacherId,
        walkthroughDate: new Date(draft.walkthroughDate),
        status: draft.status,
        evidenceSummary: draft.evidenceSummary,
        reinforcementIndicator: reinforcementEntry ? reinforcementEntry.indicatorAcronym : draft.reinforcementIndicator,
        refinementIndicator: refinementEntry ? refinementEntry.indicatorAcronym : draft.refinementIndicator,
        walkthroughEntries: [
          {
            indicatorAcronym: reinforcementEntry?.indicatorAcronym || "",
            type: "reinforcement" as const,
            aiFeedback: reinforcementEntry?.aiFeedback || "",
          },
          {
            indicatorAcronym: refinementEntry?.indicatorAcronym || "",
            type: "refinement" as const,
            aiFeedback: refinementEntry?.aiFeedback || "",
          },
        ],
      });
      lastResetId.current = walkthroughId;
    }
  }, [draft, walkthroughId, reset, entryList]);

  // Real AI feedback logic
  const generateFeedback = useAction(api.aiFeedback.generateFeedback);
  const handleAIFeedback = async () => {
    setAILoading(true);
    try {
      const evidence = watch("evidenceSummary") || "";
      const { reinforcementIndicator: reinforcementCode, refinementIndicator: refinementCode } = methods.getValues();
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
      setValue("walkthroughEntries", [
        {
          indicatorAcronym: reinforcementCode,
          type: "reinforcement" as const,
          aiFeedback: reinforcement,
        },
        {
          indicatorAcronym: refinementCode,
          type: "refinement" as const,
          aiFeedback: refinement,
        },
      ]);
      setFeedbackGenerated(true);
    } catch {
      toast({ title: "Error", description: "Failed to generate AI feedback.", variant: "destructive" });
    } finally {
      setAILoading(false);
    }
  };

  // Handler for editable feedback textareas
  const handleFeedbackChange = (type: "reinforcement" | "refinement", value: string) => {
    const entries = methods.getValues("walkthroughEntries") || [];
    // Ensure aiFeedback is always a string and cast to WalkthroughEntry[]
    const normalizedEntries: WalkthroughEntry[] = entries.map((entry) => ({
      ...entry,
      aiFeedback: entry.aiFeedback ?? "",
    }));
    const updatedEntries = normalizedEntries.map((entry) =>
      entry.type === type
        ? { ...entry, type: type as typeof entry.type, aiFeedback: value }
        : entry
    );
    methods.setValue("walkthroughEntries", updatedEntries);
  };

  // Submit handler (finalize)
  const onSubmit = async (data: WalkthroughFormData) => {
    try {
      setValue("status", "completed");
      await methods.trigger(); // ensure freshest form state
      const walkthroughDate = data.walkthroughDate instanceof Date
        ? data.walkthroughDate.getTime()
        : Number(data.walkthroughDate);
      const entries = methods.getValues("walkthroughEntries");
      console.log("[onSubmit] After trigger, walkthroughEntries:", entries);
      const finalValidation = walkthroughFinalSchema.safeParse({
        ...data,
        status: "completed",
        walkthroughEntries: entries,
        walkthroughDate,
      });
      if (!finalValidation.success) {
        toast({
          title: "Validation Error",
          description: finalValidation.error.errors.map((e: { message: string }) => e.message).join(", "),
          variant: "destructive",
        });
        return;
      }
      if (walkthroughId && draft) {
        // Update and finalize existing draft
        await updateWalkthrough({
          walkthroughId,
          teacherId: data.teacherId as Id<"teachers">,
          walkthroughDate,
          status: "completed",
          reinforcementIndicator: data.reinforcementIndicator,
          refinementIndicator: data.refinementIndicator,
          evidenceSummary: data.evidenceSummary,
          walkthroughEntries: entries,
        });
      } else {
        // Create new finalized walkthrough
        await createWalkthrough({
          teacherId: data.teacherId as Id<"teachers">,
          walkthroughDate,
          status: "completed",
          reinforcementIndicator: data.reinforcementIndicator,
          refinementIndicator: data.refinementIndicator,
          evidenceSummary: data.evidenceSummary,
          walkthroughEntries: entries,
        });
      }
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
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>{walkthroughId ? "Edit Walkthrough Draft" : "New Walkthrough"}</CardTitle>
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
              {(() => {
                const entries = watch("walkthroughEntries") || [];
                const reinforcementFeedback = entries.find(e => e.type === "reinforcement")?.aiFeedback || "";
                const refinementFeedback = entries.find(e => e.type === "refinement")?.aiFeedback || "";
                if (reinforcementFeedback || refinementFeedback) {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {/* Reinforcement Card */}
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-base">Reinforcement Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={reinforcementFeedback}
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
                            value={refinementFeedback}
                            onChange={e => handleFeedbackChange("refinement", e.target.value)}
                            rows={4}
                            className="w-full"
                            placeholder="AI-generated refinement feedback will appear here."
                          />
                        </CardContent>
                      </Card>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    router.push("/dashboard");
                  }}
                >
                  Cancel
                </Button>
                {(!feedbackGenerated && !(watch("walkthroughEntries")?.find(e => e.type === "reinforcement")?.aiFeedback && watch("walkthroughEntries")?.find(e => e.type === "refinement")?.aiFeedback)) ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={handleAIFeedback}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      "Generating AI Feedback..."
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> AI Feedback
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || !((watch("walkthroughEntries")?.find(e => e.type === "reinforcement")?.aiFeedback) && (watch("walkthroughEntries")?.find(e => e.type === "refinement")?.aiFeedback))}
                  >
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