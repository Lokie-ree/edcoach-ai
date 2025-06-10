"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  BookOpen,
  CheckCircle,
  BarChart3,
  Calendar,
  Users,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

export default function MyProgressPage() {
  const { user } = useUser();
  const { isLoading, isAuthenticated, user: convexUser } = useAuthRedirect();

  // Get teacher record for current user
  const teacherRecord = useQuery(
    api.teachers.getByUserClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Get walkthroughs for this teacher
  const walkthroughs = useQuery(
    api.walkthroughs.listByTeacher,
    teacherRecord ? { teacherId: teacherRecord._id } : "skip"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !convexUser) {
    return null;
  }

  if (convexUser.role !== "teacher") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>This page is only available for teachers.</p>
      </div>
    );
  }

  const safeWalkthroughs = walkthroughs ?? [];
  
  // Calculate progress metrics
  const totalWalkthroughs = safeWalkthroughs.length;
  const completedWalkthroughs = safeWalkthroughs.filter(w => w.status === "completed").length;
  const completionRate = totalWalkthroughs > 0 ? Math.round((completedWalkthroughs / totalWalkthroughs) * 100) : 0;

  // Calculate indicator frequencies for strengths and growth areas
  const reinforcementIndicators: Record<string, number> = {};
  const refinementIndicators: Record<string, number> = {};

  safeWalkthroughs.forEach(walkthrough => {
    if (walkthrough.status === "completed") {
      if (walkthrough.reinforcementIndicator) {
        reinforcementIndicators[walkthrough.reinforcementIndicator] = 
          (reinforcementIndicators[walkthrough.reinforcementIndicator] || 0) + 1;
      }
      if (walkthrough.refinementIndicator) {
        refinementIndicators[walkthrough.refinementIndicator] = 
          (refinementIndicators[walkthrough.refinementIndicator] || 0) + 1;
      }
    }
  });

  // Get top 3 strengths and growth areas
  const topStrengths = Object.entries(reinforcementIndicators)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
    
  const topGrowthAreas = Object.entries(refinementIndicators)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Calculate recent progress (last 30 days vs previous 30 days)
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

  const recentWalkthroughs = safeWalkthroughs.filter(w => w.walkthroughDate >= thirtyDaysAgo);
  const previousWalkthroughs = safeWalkthroughs.filter(w => 
    w.walkthroughDate >= sixtyDaysAgo && w.walkthroughDate < thirtyDaysAgo
  );

  const recentCount = recentWalkthroughs.length;
  const previousCount = previousWalkthroughs.length;
  const trendDirection = recentCount > previousCount ? "up" : recentCount < previousCount ? "down" : "same";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Progress
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your professional growth and development over time
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid gap-4 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Walkthroughs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWalkthroughs}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {trendDirection === "up" && <ArrowUp className="h-3 w-3 text-green-500 mr-1" />}
              {trendDirection === "down" && <ArrowDown className="h-3 w-3 text-red-500 mr-1" />}
              {trendDirection === "same" && <Minus className="h-3 w-3 text-gray-500 mr-1" />}
              {recentCount} this month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strengths Found</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topStrengths.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Key strengths identified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Areas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topGrowthAreas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Areas for development
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strengths and Growth Areas */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topStrengths.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reinforcements yet</p>
                <p className="text-sm">Complete more walkthroughs to see your strengths</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topStrengths.map(([indicator, count]) => (
                  <div key={indicator} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{indicator}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={(count / completedWalkthroughs) * 100} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {count} time{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Growth Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Growth Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topGrowthAreas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No refinements yet</p>
                <p className="text-sm">Complete more walkthroughs to see growth opportunities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topGrowthAreas.map(([indicator, count]) => (
                  <div key={indicator} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{indicator}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={(count / completedWalkthroughs) * 100} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {count} time{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safeWalkthroughs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No walkthroughs yet</p>
                <p className="text-sm">Your progress tracking will appear here once you have walkthroughs</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{recentCount}</div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{previousCount}</div>
                  <p className="text-sm text-muted-foreground">Last Month</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    {trendDirection === "up" && <TrendingUp className="h-6 w-6 text-green-500" />}
                    {trendDirection === "down" && <TrendingDown className="h-6 w-6 text-red-500" />}
                    {trendDirection === "same" && <Minus className="h-6 w-6 text-gray-500" />}
                    <span className={
                      trendDirection === "up" ? "text-green-500" : 
                      trendDirection === "down" ? "text-red-500" : "text-gray-500"
                    }>
                      {trendDirection === "up" ? "Up" : trendDirection === "down" ? "Down" : "Same"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Coach Connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Coach Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {convexUser.coachId ? "Connected to Coach" : "No Coach Assigned"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {convexUser.coachId 
                    ? "Your coach can view your progress and provide feedback"
                    : "Contact your administrator to get assigned to a coach"
                  }
                </p>
              </div>
              <Badge variant={convexUser.coachId ? "default" : "secondary"}>
                {convexUser.coachId ? "Active" : "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 