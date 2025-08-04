import { z } from "zod";

export const walkthroughSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  walkthroughDate: z.union([z.number(), z.string(), z.date()]),
  evidenceSummary: z.string().min(1, "Evidence summary is required"),
  reinforcementIndicator: z.string().min(1, "Reinforcement indicator is required"),
  refinementIndicator: z.string().min(1, "Refinement indicator is required"),
});