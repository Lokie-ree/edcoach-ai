import { Id } from "@/convex/_generated/dataModel";

export type WalkthroughDoc = {
  _id: Id<"walkthroughs">;
  _creationTime: number;
  teacherId: Id<"teachers">;
  observerId: Id<"users">;
  walkthroughDate: number;
  status: "draft" | "completed";
  evidenceSummary: string;
  reinforcementIndicator: string;
  refinementIndicator: string;
  createdAt: number;
  updatedAt: number;
};

export type ConvexUser = {
  _id: Id<"users">;
  role: "teacher" | "coach";
  onboardingComplete?: boolean;
  name: string;
  email: string;
  clerkId: string;
  createdAt: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TeacherRecord = any;

export type ClerkUser = {
  firstName?: string | null;
  fullName?: string | null;
  id: string;
  organizationMemberships?: Array<{
    role: string;
  }>;
}; 