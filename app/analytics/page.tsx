"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getIndicatorName } from "@/lib/indicator-utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Target, 
  MessageSquare, 
  AlertCircle,
  Clock,
  TrendingUp,
  CheckCircle2,
  FileText,
  ArrowRight,
  BarChart3,
  PieChart
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

// Define proper types based on Convex analytics return types
interface IndicatorCount {
  indicator: string;
  count: number;
}

interface TeacherProgress {
  teacherId: string;
  teacherName: string;
  totalWalkthroughs: number;
  completedWalkthroughs: number;
  draftWalkthroughs: number;
  lastObservation?: number;
  completionRate: number;
  recentFeedbackCount: number;
}

interface MonthlyTrend {
  month: string;
  completed: number;
  draft: number;
  total: number;
}

interface ActionItem {
  type: string;
  priority: string;
  title: string;
  description: string;
  teacherId?: string;
  teacherName?: string;
}

interface AnalyticsData {
  // Overview metrics
  totalTeachers: number;
  activeTeachers: number;
  totalWalkthroughs: number;
  thisMonthWalkthroughs: number;
  completedWalkthroughs: number;
  draftWalkthroughs: number;
  completionRate: number;
  
  // Feedback metrics
  totalFeedbackInteractions: number;
  avgFeedbackPerTeacherPerMonth: number;
  reinforcementCount: number;
  refinementCount: number;
  
  // Indicator analysis
  topReinforcementIndicators: IndicatorCount[];
  topRefinementIndicators: IndicatorCount[];
  
  // Teacher progress data
  teacherProgress: TeacherProgress[];
  
  // Monthly trends
  monthlyTrends: MonthlyTrend[];
  
  // Action items
  actionItems: ActionItem[];
}

// Type for getCoachAnalytics result
interface CoachAnalyticsResult {
  totalTeachers: number;
  activeTeachers: number;
  totalWalkthroughs: number;
  totalFeedbackGenerated: number;
  recentWalkthroughs: Array<{
    _id: string;
    title: string;
    createdAt: number;
    teacherName: string;
    hasAiFeedback: boolean;
  }>;
}

// Helper to map getCoachAnalytics result to AnalyticsData
function mapCoachAnalyticsToAnalyticsData(data: CoachAnalyticsResult): AnalyticsData {
  return {
    totalTeachers: data.totalTeachers,
    activeTeachers: data.activeTeachers,
    totalWalkthroughs: data.totalWalkthroughs,
    thisMonthWalkthroughs: 0, // Default or calculate if possible
    completedWalkthroughs: 0, // Default or calculate if possible
    draftWalkthroughs: 0, // Default or calculate if possible
    completionRate: 0, // Default or calculate if possible
    totalFeedbackInteractions: data.totalFeedbackGenerated ?? 0,
    avgFeedbackPerTeacherPerMonth: 0, // Default or calculate if possible
    reinforcementCount: 0, // Default or calculate if possible
    refinementCount: 0, // Default or calculate if possible
    topReinforcementIndicators: [],
    topRefinementIndicators: [],
    teacherProgress: [],
    monthlyTrends: [],
    actionItems: [],
  };
}

// Overview Metrics Cards
const OverviewMetrics = ({ analytics }: { analytics: AnalyticsData | null | undefined }) => {
  if (!analytics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Active Teachers",
      value: analytics.activeTeachers,
      subtitle: `${analytics.totalTeachers} total assigned`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Monthly Walkthroughs",
      value: analytics.thisMonthWalkthroughs,
      subtitle: "This month",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Completion Rate",
      value: `${analytics.completionRate}%`,
      subtitle: "Walkthroughs completed",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Avg Feedback/Teacher",
      value: analytics.avgFeedbackPerTeacherPerMonth,
      subtitle: "Per month",
      icon: MessageSquare,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.subtitle}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Feedback Analysis Section
const FeedbackAnalysis = ({ analytics }: { analytics: AnalyticsData | null | undefined }) => {
  if (!analytics) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Donut chart for feedback distribution
  const DonutChart = () => {
    const total = analytics.reinforcementCount + analytics.refinementCount;
    
    if (total === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No feedback data yet</p>
        </div>
      );
    }

    const reinforcementPercent = (analytics.reinforcementCount / total) * 100;
    const refinementPercent = (analytics.refinementCount / total) * 100;

    return (
      <div className="flex flex-col items-center justify-center h-48">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray={`${reinforcementPercent} ${100 - reinforcementPercent}`}
              strokeDashoffset="25"
              transform="rotate(-90 18 18)"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray={`${refinementPercent} ${100 - refinementPercent}`}
              strokeDashoffset={`${25 - reinforcementPercent}`}
              transform="rotate(-90 18 18)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Reinforcement ({analytics.reinforcementCount})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Refinement ({analytics.refinementCount})</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Feedback Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3 text-green-700 dark:text-green-400">
                Most Reinforced
              </h4>
              {analytics.topReinforcementIndicators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topReinforcementIndicators.slice(0, 3).map((item) => (
                    <div key={item.indicator} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1 mr-2" title={getIndicatorName(item.indicator)}>
                        {getIndicatorName(item.indicator)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${(item.count / Math.max(...analytics.topReinforcementIndicators.map((i) => i.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-blue-700 dark:text-blue-400">
                Most Refined
              </h4>
              {analytics.topRefinementIndicators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topRefinementIndicators.slice(0, 3).map((item) => (
                    <div key={item.indicator} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1 mr-2" title={getIndicatorName(item.indicator)}>
                        {getIndicatorName(item.indicator)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${(item.count / Math.max(...analytics.topRefinementIndicators.map((i) => i.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Monthly Trends Chart
const MonthlyTrends = ({ analytics }: { analytics: AnalyticsData | null | undefined }) => {
  if (!analytics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(
    ...analytics.monthlyTrends.map((trend) => trend.total),
    1
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.monthlyTrends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trend data available</p>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between sm:justify-center sm:gap-4 overflow-x-auto pb-4">
              {analytics.monthlyTrends.map((trend) => (
                <div key={trend.month} className="flex flex-col items-center min-w-[60px] sm:min-w-0">
                  <div className="flex flex-col items-center gap-1 mb-2">
                    {/* Completed bar */}
                    <div
                      className="w-8 sm:w-12 bg-green-500 rounded-t transition-all hover:opacity-80"
                      style={{
                        height: Math.max(4, (trend.completed / maxValue) * 200),
                      }}
                      title={`Completed: ${trend.completed}`}
                    ></div>
                    {/* Draft bar */}
                    <div
                      className="w-8 sm:w-12 bg-blue-500 rounded-b transition-all hover:opacity-80"
                      style={{
                        height: Math.max(4, (trend.draft / maxValue) * 200),
                      }}
                      title={`Draft: ${trend.draft}`}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">
                    {trend.month}
                  </span>
                  <span className="text-xs font-medium text-center">
                    {trend.total}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Draft</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Action Items Section
const ActionItems = ({ analytics }: { analytics: AnalyticsData | null | undefined }) => {
  if (!analytics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-800";
      case "low":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      case "low":
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Action Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analytics.actionItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No action items</p>
            <p className="text-sm">All tasks are complete!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.actionItems.map((item, index) => (
              <div 
                key={`${item.type}-${item.teacherId || index}`}
                className="p-3 border border-border rounded-lg hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(item.priority)}`}
                      >
                        <span className="flex items-center gap-1">
                          {getPriorityIcon(item.priority)}
                          {item.priority}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AnalyticsDashboardPage() {
  const { user, isLoaded } = useUser();
  // Get convex user data
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip"
  );
  // Get analytics data for coach
  const rawAnalytics = useQuery(
    api.analytics.getCoachAnalytics,
    convexUser?.role === "coach" ? {} : "skip"
  );
  const analytics = rawAnalytics ? mapCoachAnalyticsToAnalyticsData(rawAnalytics) : null;

  if (!isLoaded || (user && convexUser === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block"></span>
      </div>
    );
  }

  if (!user || !convexUser) {
    return null;
  }

  if (convexUser?.role !== "coach") {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Only coaches can view analytics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights and metrics for your coaching effectiveness"
        gradient={true}
      />

      {/* Overview Metrics */}
      <OverviewMetrics analytics={analytics} />

      {/* Feedback Analysis */}
      <FeedbackAnalysis analytics={analytics} />

      {/* Monthly Trends */}
      <MonthlyTrends analytics={analytics} />

      {/* Action Items */}
      <ActionItems analytics={analytics} />
    </div>
  );
} 