export type ConvexUser = {
  _id: string;
  role: "teacher" | "coach";
  onboardingComplete?: boolean;
  name: string;
  email: string;
  clerkId: string;
  createdAt: number;
};

export type ClerkUser = {
  firstName?: string | null;
  fullName?: string | null;
  id: string;
  organizationMemberships?: Array<{
    role: string;
  }>;
};

// Adjust as needed for your app
export type TeacherRecord = any; 