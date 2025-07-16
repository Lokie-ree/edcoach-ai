import { PgpGoalCard } from "@/components/dashboard/PgpGoalCard";
import { RefinementFocusCard } from "@/components/dashboard/RefinementFocusCard";
import { ReflectionPromptCard } from "@/components/dashboard/ReflectionPromptCard";
import { WalkthroughTimeline } from "@/components/dashboard/WalkthroughTimeline";
import { mockData } from "../mock-data";

export default function TeacherPgpDashboardPage() {
  const { teacherDashboardData } = mockData;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* PGP Goal Card */}
      <PgpGoalCard
        title={teacherDashboardData.pgpGoal.title}
        description={teacherDashboardData.pgpGoal.description}
        progress={teacherDashboardData.pgpGoal.progress}
        trend={teacherDashboardData.pgpGoal.trend}
        targetDate={teacherDashboardData.pgpGoal.targetDate}
      />

      {/* Refinement Focus Card */}
      <RefinementFocusCard
        currentIndicator={teacherDashboardData.refinementFocus.currentIndicator}
        description={teacherDashboardData.refinementFocus.description}
        progress={teacherDashboardData.refinementFocus.progress}
        nextSteps={teacherDashboardData.refinementFocus.nextSteps}
      />

      {/* Reflection Prompt Card */}
      <ReflectionPromptCard
        question={teacherDashboardData.reflectionPrompt.question}
        lastAnswered={teacherDashboardData.reflectionPrompt.lastAnswered}
        isOverdue={teacherDashboardData.reflectionPrompt.isOverdue}
      />

      {/* Walkthrough Timeline */}
      <WalkthroughTimeline walkthroughs={teacherDashboardData.recentWalkthroughs} />
    </div>
  );
} 