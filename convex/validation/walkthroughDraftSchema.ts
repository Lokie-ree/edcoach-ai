import { z } from "zod";

export const walkthroughDraftSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  walkthroughDate: z.union([z.number(), z.string(), z.date()]),
  status: z.literal("draft"),
  evidenceSummary: z.string().optional(),
  reinforcementIndicator: z.string().optional(),
  refinementIndicator: z.string().optional(),
  walkthroughEntries: z
    .array(
      z.object({
        indicatorAcronym: z.string().optional(),
        type: z.enum(["reinforcement", "refinement"]),
        aiFeedback: z.string().optional(),
      })
    )
    .optional(),
}); 