import { z } from "zod";

export const walkthroughFinalSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  walkthroughDate: z.union([z.number(), z.string(), z.date()]),
  status: z.literal("completed"),
  evidenceSummary: z.string().min(1, "Evidence summary is required"),
  reinforcementIndicator: z.string().min(1, "Reinforcement indicator is required"),
  refinementIndicator: z.string().min(1, "Refinement indicator is required"),
  walkthroughEntries: z
    .array(
      z.object({
        indicatorAcronym: z.string().min(1, "Indicator acronym is required"),
        type: z.enum(["reinforcement", "refinement"]),
        aiFeedback: z.string().min(1, "AI feedback is required"),
      })
    )
    .length(2, "You must provide both a reinforcement and a refinement entry"),
}); 