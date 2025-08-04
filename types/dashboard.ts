import { Id } from "@/convex/_generated/dataModel";

export type WalkthroughDoc = {
  _id: Id<"walkthroughs">;
  _creationTime: number;
  teacherId: Id<"teachers">;
  observerId: Id<"users">;
  walkthroughDate: number;
  status: "completed";
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

// Analytics Types
export interface IndicatorCount {
  indicator: string;
  indicatorName: string;
  count: number;
}

export interface DomainPerformance {
  domain: string;
  reinforcementCount: number;
  refinementCount: number;
  totalCount: number;
  strengthPercentage: number;
}

export interface TeacherProgressMatrix {
  teacherId: string;
  teacherName: string;
  domainScores: Array<{
    domain: string;
    status: "strength" | "developing" | "needs_focus";
    reinforcementCount: number;
    refinementCount: number;
  }>;
  lastObservation?: number;
}

export interface CoachingInsight {
  type: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface TeacherProgress {
  teacherId: string;
  teacherName: string;
  totalWalkthroughs: number;
  completedWalkthroughs: number;

  lastObservation?: number;
  completionRate: number;
  recentFeedbackCount: number;
}

export interface MonthlyTrend {
  month: string;
  completed: number;
  
  total: number;
}

export interface AnalyticsData {
  totalTeachers: number;
  activeTeachers: number;
  totalWalkthroughs: number;
  thisMonthWalkthroughs: number;
  completedWalkthroughs: number;

  totalAiFeedbackGenerated: number;
  totalFeedbackInteractions: number;
  teachersWithRecentActivity: number;
  reinforcementCount: number;
  refinementCount: number;
  topStrengths: IndicatorCount[];
  topGrowthAreas: IndicatorCount[];
  domainPerformance: DomainPerformance[];
  teacherProgressMatrix: TeacherProgressMatrix[];
  coachingInsights: CoachingInsight[];
  teacherProgress: TeacherProgress[];
  monthlyTrends: MonthlyTrend[];
}
