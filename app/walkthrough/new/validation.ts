import { z } from "zod";

// Base schema for common fields
const baseObservationSchema = z.object({
  teacherId: z.string({
    required_error: "Teacher selection is required",
  }).min(1, "Teacher selection is required"),
  observationDate: z.date({
    required_error: "Observation date is required",
  }),
});

// Schema for the "Type" selection step (though often handled by UI state)
export const typeStepSchema = z.object({
  type: z.enum(["formal", "walkthrough"], {
    required_error: "Observation type must be selected."
  }),
});

// Schema for "Details" step of a Formal Observation
export const formalDetailsStepSchema = baseObservationSchema.extend({
  subject: z.string({
    required_error: "Subject is required",
  }).min(1, "Subject is required"),
  gradeLevels: z.array(z.string()).min(1, {
    message: "At least one grade level must be selected",
  }),
});

// Schema for "Rubric" step of a Formal Observation
// This is a placeholder; actual validation might be more complex (e.g., all items rated)
export const formalRubricStepSchema = z.object({
  rubricResponses: z.record(z.string(), z.number()).refine(val => Object.keys(val).length > 0, {
    message: "At least one rubric item must be rated."
    // Add more specific validation as needed, e.g., check if all required indicators are present
  }), 
});

// Schema for the main Informal Walkthrough step
export const informalWalkthroughStepSchema = z.object({
  teacherId: z.string().min(1, "Teacher selection is required"),
  observationDate: z.union([z.number(), z.string(), z.date()]),
  reinforcementIndicator: z.string().min(1, "Reinforcement indicator is required"),
  refinementIndicator: z.string().min(1, "Refinement indicator is required"),
  evidenceSummary: z.string().min(1, { message: "Evidence summary is required" }),
});


// FOR FINAL SUBMISSION (as previously defined, can be kept for final form validation)

// Schema specific to formal observations (for final submission)
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

// Walkthrough entry schema (updated, no comment field)
// Schema specific to walkthroughs (for final submission)
export const walkthroughSchema = z.object({
  type: z.literal("walkthrough"),
  teacherId: z.string().min(1, "Teacher selection is required"),
  walkthroughDate: z.union([z.number(), z.string(), z.date()]),
  status: z.enum(["draft", "completed"]),
  title: z.string().min(1, { message: "Title is required" }),
  evidenceSummary: z.string().min(1, { message: "Evidence summary is required" }),
  reinforcementIndicator: z.string().min(1, "Reinforcement indicator is required"),
  refinementIndicator: z.string().min(1, "Refinement indicator is required"),
  walkthroughEntries: z.array(
    z.object({
      indicatorAcronym: z.string(),
      type: z.enum(["reinforcement", "refinement"]),
      aiFeedback: z.string().optional(),
    })
  ).length(2, "You must provide both a reinforcement and a refinement entry"),
});

// Union type to discriminate between the two types (for final submission)
export const observationSchema = z.discriminatedUnion("type", [
  formalObservationSchema,
  walkthroughSchema,
]);

export type ObservationFormData = z.infer<typeof observationSchema>; 