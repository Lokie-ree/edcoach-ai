export type StrengthOrGrowth = {
  indicator: string;
  indicatorName: string;
  count: number;
  percent: number;
};

export type Reinforcement = {
  indicator: string;
  indicatorName: string;
  walkthroughDate: number;
  aiFeedback: string;
};

export type CoachInfo = {
  name: string;
  email: string;
};

export type CoachingStats = {
  totalWalkthroughs: number;
  completedWalkthroughs: number;
  draftWalkthroughs: number;
  lastObservation: number | null;
  latestFeedback: string | null;
  latestIndicator: string | null;
};

export type MyProgressData = {
  strengths: StrengthOrGrowth[];
  growthAreas: StrengthOrGrowth[];
  recentReinforcements: Reinforcement[];
  coach: CoachInfo | null;
  coachingStats: CoachingStats;
}; 