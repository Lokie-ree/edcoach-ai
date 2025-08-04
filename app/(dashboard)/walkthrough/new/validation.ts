import { z } from "zod";

// Simple walkthrough schema for the simplified 3-step process
export const walkthroughSchema = z.object({
  teacherId: z.string().min(1, "Teacher selection is required"),
  walkthroughDate: z.union([z.number(), z.string(), z.date()]),
  evidenceSummary: z.string().min(1, { message: "Evidence summary is required" }),
  reinforcementIndicator: z.string().min(1, "Reinforcement indicator is required"),
  refinementIndicator: z.string().min(1, "Refinement indicator is required"),
  reinforcementFeedback: z.string().min(1, "Reinforcement feedback is required"),
  refinementFeedback: z.string().min(1, "Refinement feedback is required"),
});

export type WalkthroughFormData = z.infer<typeof walkthroughSchema>;

// Step-specific validation schemas for the 3-step wizard
export const step1Schema = z.object({
  teacherId: z.string().min(1, "Teacher selection is required"),
  walkthroughDate: z.union([z.number(), z.string(), z.date()]),
});

export const step2Schema = z.object({
  reinforcementIndicator: z.string().min(1, "Reinforcement indicator is required"),
  refinementIndicator: z.string().min(1, "Refinement indicator is required"),
});

export const step3Schema = z.object({
  evidenceSummary: z.string().min(1, { message: "Evidence summary is required" }),
});