import { z } from "zod";

// Base schema for common fields
const baseObservationSchema = z.object({
  teacherId: z.string({
    required_error: "Teacher selection is required",
  }).min(1, "Teacher selection is required"), // Ensure not empty string
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
export const informalWalkthroughStepSchema = baseObservationSchema.extend({
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
  reinforcementComments: z.record(z.string(), z.string().min(1, "Comment is required for selected indicator.").max(1000, {
    message: "Comment cannot exceed 1000 characters",
  })).refine(val => Object.keys(val).length > 0, { // Ensure comments for selected indicators
    message: "Comments are required for all selected reinforcement indicators."
  }),
  refinementComments: z.record(z.string(), z.string().min(1, "Comment is required for selected indicator.").max(1000, {
    message: "Comment cannot exceed 1000 characters",
  })).refine(val => Object.keys(val).length > 0, { // Ensure comments for selected indicators
    message: "Comments are required for all selected refinement indicators."
  }),
  additionalComments: z.string().max(2000, {
    message: "Additional comments cannot exceed 2000 characters",
  }).optional(),
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

// Schema specific to walkthroughs (for final submission)
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
  // For final submission, comments might be structured differently or validated as a whole
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

// Union type to discriminate between the two types (for final submission)
export const observationSchema = z.discriminatedUnion("type", [
  formalObservationSchema,
  walkthroughSchema,
]);

export type ObservationFormData = z.infer<typeof observationSchema>; 