import { Users, BookOpen, MessageSquare } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PrioritiesPanel } from "@/components/dashboard/PrioritiesPanel";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { mockData } from "../mock-data";

export default function CoachDashboardPage() {
  const { coachDashboardData } = mockData;

  return (
    <div className="py-4 md:py-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Teachers"
          value={coachDashboardData.kpis.totalTeachers}
          icon={Users}
          description="Active teachers in your portfolio"
        />
        <KpiCard
          title="Active Teachers"
          value={coachDashboardData.kpis.activeTeachers}
          icon={Users}
          description="Teachers with recent activity"
        />
        <KpiCard
          title="Total Walkthroughs"
          value={coachDashboardData.kpis.totalWalkthroughs}
          icon={BookOpen}
          description="Walkthroughs completed this month"
        />
        <KpiCard
          title="Feedback Generated"
          value={coachDashboardData.kpis.totalFeedback}
          icon={MessageSquare}
          description="AI feedback pieces created"
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Priorities Panel */}
        <PrioritiesPanel
          walkthroughsDue={coachDashboardData.priorities.walkthroughsDue}
          reflectionsToReview={coachDashboardData.priorities.reflectionsToReview}
          teachersNeedingSupport={coachDashboardData.priorities.teachersNeedingSupport}
        />

        {/* Recent Activity Feed */}
        <RecentActivityFeed activities={coachDashboardData.recentActivity} />
      </div>
    </div>
  );
}
