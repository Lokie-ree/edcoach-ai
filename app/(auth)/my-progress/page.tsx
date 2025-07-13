"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Award,
  Target,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { getIndicatorName } from "@/lib/IndicatorUtils";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export default function MyProgressPage() {
  const { user, isLoaded } = useUser();
  
  // Get convex user data
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip"
  );

  // Get teacher record for current user
  const teacherRecord = useQuery(
    api.teachers.getMyRecord,
    convexUser?.role === "teacher" ? {} : "skip"
  );

  // Fetch coach info using coachId from teacher record
  const coach = useQuery(
    api.users.getById,
    teacherRecord ? { userId: teacherRecord.coachId } : "skip"
  );

  // Get walkthroughs for this teacher
  const walkthroughs = useQuery(
    api.walkthroughs.listByTeacher,
    teacherRecord ? { teacherId: teacherRecord._id } : "skip"
  );

  // Get walkthrough entries for reinforcement feedback
  const walkthroughEntries = useQuery(
    api.walkthroughEntries.listByTeacher,
    teacherRecord ? { teacherId: teacherRecord._id } : "skip"
  );

  // Get recent reinforcement entries (last 8-10)
  const recentReinforcements = useMemo(() => {
    if (!walkthroughEntries || !walkthroughs) return [];
    
    const safeWalkthroughs = walkthroughs ?? [];
    const reinforcements = walkthroughEntries
      .filter(entry => entry.type === "reinforcement" && entry.aiFeedback)
      .map(entry => {
        const walkthrough = safeWalkthroughs.find(w => w._id === entry.walkthroughId);
        return {
          ...entry,
          walkthroughDate: walkthrough?.walkthroughDate || 0,
          indicatorName: getIndicatorName(entry.indicatorAcronym || "")
        };
      })
      .sort((a, b) => b.walkthroughDate - a.walkthroughDate)
      .slice(0, 8);
    
    return reinforcements;
  }, [walkthroughEntries, walkthroughs]);

  // Calculate coaching relationship stats
  const coachingStats = useMemo(() => {
    if (!walkthroughs) return null;
    const safeWalkthroughs = walkthroughs ?? [];
    const totalWalkthroughs = safeWalkthroughs.length;
    const recentWalkthrough = safeWalkthroughs.length > 0 ? 
      safeWalkthroughs.sort((a, b) => b.walkthroughDate - a.walkthroughDate)[0] : null;
    const completedWalkthroughs = safeWalkthroughs.filter(w => w.status === "completed").length;
    const draftWalkthroughs = safeWalkthroughs.filter(w => w.status === "draft").length;
    // Get most recent coaching feedback
    const latestReinforcement = recentReinforcements.length > 0 ? recentReinforcements[0] : null;
    return {
      totalWalkthroughs,
      completedWalkthroughs,
      draftWalkthroughs,
      lastObservation: recentWalkthrough?.walkthroughDate,
      latestFeedback: latestReinforcement?.aiFeedback,
      latestIndicator: latestReinforcement?.indicatorName
    };
  }, [walkthroughs, recentReinforcements]);

  if (!isLoaded || (user && convexUser === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !convexUser) {
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
  const completedWalkthroughs = safeWalkthroughs.filter(w => w.status === "completed").length;

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
  // These variables are prepared for future use but not currently displayed in the UI
  // const now = Date.now();
  // const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  // const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
  // const recentWalkthroughs = safeWalkthroughs.filter(w => w.walkthroughDate >= thirtyDaysAgo);
  // const previousWalkthroughs = safeWalkthroughs.filter(w => 
  //   w.walkthroughDate >= sixtyDaysAgo && w.walkthroughDate < thirtyDaysAgo
  // );
  // const recentCount = recentWalkthroughs.length;
  // const previousCount = previousWalkthroughs.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Progress"
        description="Track your professional growth and development over time"
      />

      {/* Strengths and Growth Areas */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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
                      <p className="font-medium text-sm">{getIndicatorName(indicator)}</p>
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
                      <p className="font-medium text-sm">{getIndicatorName(indicator)}</p>
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

      {/* Recent Reinforcements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Recent Reinforcements
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your recent strengths and positive feedback
            </p>
          </CardHeader>
          <CardContent>
            {recentReinforcements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reinforcements yet</p>
                <p className="text-sm">Complete walkthroughs to see your positive feedback here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReinforcements.map((reinforcement, index) => (
                  <div key={`${reinforcement.walkthroughId}-${index}`} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {reinforcement.indicatorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reinforcement.walkthroughDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {reinforcement.aiFeedback}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Coach Connection (Coach) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!coach ? (
              <div className="text-center py-8 text-muted-foreground">Your coach will appear here.</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <p className="font-medium">{coach.name}</p>
                    <p className="text-sm text-muted-foreground">Your Coach</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                {/* Collaboration Stats */}
                {coachingStats && (
                  <div className="grid grid-cols-3 gap-4 py-3 border-b">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{coachingStats.totalWalkthroughs}</div>
                      <p className="text-xs text-muted-foreground">Walkthroughs</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{coachingStats.completedWalkthroughs}</div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {coachingStats.lastObservation ? 
                          `${Math.floor((Date.now() - coachingStats.lastObservation) / (1000 * 60 * 60 * 24))}d` : 
                          "N/A"
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Days Ago</p>
                    </div>
                  </div>
                )}
                {/* Latest Coaching Insight */}
                {coachingStats?.latestFeedback && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Latest Coaching Insight</p>
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border-l-3 border-green-500">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                        {coachingStats.latestIndicator}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {coachingStats.latestFeedback.length > 120 ? 
                          `${coachingStats.latestFeedback.substring(0, 120)}...` : 
                          coachingStats.latestFeedback
                        }
                      </p>
                    </div>
                  </div>
                )}
                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Send Message
                  </Button>
                </div>
                {/* Next Steps Placeholder */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Upcoming
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {coachingStats?.draftWalkthroughs && coachingStats.draftWalkthroughs > 0
                      ? `${coachingStats.draftWalkthroughs} draft walkthrough${coachingStats.draftWalkthroughs === 1 ? '' : 's'} pending completion`
                      : "Next coaching session: Schedule with your coach"
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 