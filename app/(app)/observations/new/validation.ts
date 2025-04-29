import { z } from "zod";

// Define the base schema for both formal observations and walkthroughs
const baseObservationSchema = z.object({
  teacherId: z.string({
    required_error: "Teacher selection is required",
  }),
  observationDate: z.date({
    required_error: "Observation date is required",
  }),
});

// Schema specific to formal observations
export const formalObservationSchema = baseObservationSchema.extend({
  type: z.literal("formal"),
  subject: z.string({
    required_error: "Subject is required",
  }),
  gradeLevels: z.array(z.string()).min(1, {
    message: "At least one grade level must be selected",
  }),
  reinforcementComment: z.string().optional(),
  refinementComment: z.string().optional(),
  rubricResponses: z.record(z.string(), z.number()),
});

// Schema specific to walkthroughs
export const walkthroughSchema = baseObservationSchema.extend({
  type: z.literal("walkthrough"),
  reinforcementIndicators: z.array(z.string()).min(1, {
    message: "At least one reinforcement indicator must be selected",
  }).max(3, {
    message: "Maximum of 3 reinforcement indicators allowed",
  }),
  refinementIndicators: z.array(z.string()).min(1, {
    message: "At least one refinement indicator must be selected",
  }).max(3, {
    message: "Maximum of 3 refinement indicators allowed",
  }),
  reinforcementComments: z.record(z.string(), z.string().max(1000, {
    message: "Comment cannot exceed 1000 characters",
  })),
  refinementComments: z.record(z.string(), z.string().max(1000, {
    message: "Comment cannot exceed 1000 characters",
  })),
  additionalComments: z.string().max(2000, {
    message: "Additional comments cannot exceed 2000 characters",
  }).optional(),
});

// Union type to discriminate between the two types
export const observationSchema = z.discriminatedUnion("type", [
  formalObservationSchema,
  walkthroughSchema,
]);

export type ObservationFormData = z.infer<typeof observationSchema>; 