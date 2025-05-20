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
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = methods;
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">New Walkthrough</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Teacher</label>
            <select {...register("teacherId")} className="input input-bordered w-full">
              <option value="">Select a teacher</option>
              {teachers.length === 0 && <option disabled>Loading...</option>}
              {teachers.map((teacher: Teacher) => (
                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
              ))}
            </select>
            {errors.teacherId && <p className="text-red-500 text-sm">{errors.teacherId.message as string}</p>}
          </div>
          <div>
            <label className="block font-medium">Date</label>
            <input type="date" {...register("walkthroughDate")} className="input input-bordered w-full" />
            {errors.walkthroughDate && <p className="text-red-500 text-sm">{errors.walkthroughDate.message as string}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Reinforcement Indicator</label>
            <select {...register("reinforcementIndicator")} className="input input-bordered w-full">
              <option value="">Select an indicator</option>
              {indicators.length === 0 && <option disabled>Loading...</option>}
              {indicators.map((indicator: Indicator) => (
                <option key={indicator.indicator_code} value={indicator.indicator_code}>{indicator.indicator_name}</option>
              ))}
            </select>
            {errors.reinforcementIndicator && <p className="text-red-500 text-sm">{errors.reinforcementIndicator.message as string}</p>}
          </div>
          <div>
            <label className="block font-medium">Refinement Indicator</label>
            <select {...register("refinementIndicator")} className="input input-bordered w-full">
              <option value="">Select an indicator</option>
              {indicators.length === 0 && <option disabled>Loading...</option>}
              {indicators.map((indicator: Indicator) => (
                <option key={indicator.indicator_code} value={indicator.indicator_code}>{indicator.indicator_name}</option>
              ))}
            </select>
            {errors.refinementIndicator && <p className="text-red-500 text-sm">{errors.refinementIndicator.message as string}</p>}
          </div>
        </div>
        <div>
          <label className="block font-medium">Evidence Summary</label>
          <textarea {...register("evidenceSummary")} className="textarea textarea-bordered w-full" />
          {errors.evidenceSummary && <p className="text-red-500 text-sm">{errors.evidenceSummary.message as string}</p>}
        </div>
        <div className="flex gap-4">
          <button type="button" className="btn btn-secondary" onClick={handleAIFeedback} disabled={aiLoading}>
            {aiLoading ? "Generating AI Feedback..." : "Generate AI Feedback"}
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
        {/* AI Feedback Section */}
        {(aiFeedback.reinforcement || aiFeedback.refinement) && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">AI Feedback</h3>
            <div>
              <strong>Reinforcement:</strong> {aiFeedback.reinforcement}
            </div>
            <div>
              <strong>Refinement:</strong> {aiFeedback.refinement}
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
} 