export interface Walkthrough {
  _id: string;
  walkthroughDate: number;
  status: "completed";
  evidenceSummary: string;
  reinforcementIndicator: string;
  refinementIndicator: string;
  teacherId: string;
  teacherName?: string;
}

export type FeedbackEntry = {
  type: "reinforcement" | "refinement";
  aiFeedback?: string;
};

export type Feedback = {
  entries: FeedbackEntry[];
  getIndicatorName: (indicator: string) => string;
}; 