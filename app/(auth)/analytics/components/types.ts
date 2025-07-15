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
  draftWalkthroughs: number;
  lastObservation?: number;
  completionRate: number;
  recentFeedbackCount: number;
}

export interface MonthlyTrend {
  month: string;
  completed: number;
  draft: number;
  total: number;
}

export interface AnalyticsData {
  totalTeachers: number;
  activeTeachers: number;
  totalWalkthroughs: number;
  thisMonthWalkthroughs: number;
  completedWalkthroughs: number;
  draftWalkthroughs: number;
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