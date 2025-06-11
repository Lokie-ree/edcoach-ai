"use client";

import React from "react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  CheckCircle,
  Loader2,
  Award,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Id } from "@/convex/_generated/dataModel";
import { getIndicatorName } from "@/lib/indicator-utils";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/ui/page-header";

// Type definitions for better type safety
type WalkthroughDoc = {
  _id: Id<"walkthroughs">;
  _creationTime: number;
  teacherId: Id<"teachers">;
  observerId: Id<"users">;
  walkthroughDate: number;
  status: "draft" | "completed";
  evidenceSummary: string;
  reinforcementIndicator: string;
  refinementIndicator: string;
  createdAt: number;
  updatedAt: number;
};

type ConvexUser = {
  _id: Id<"users">;
  role: "teacher" | "coach";
  coachId?: Id<"users">;
  onboardingComplete?: boolean;
  name: string;
  email: string;
  organization: string;
  clerkId: string;
  createdAt: number;
};

// Removing unused type definition - using 'any' where needed with eslint-disable comments

type ClerkUser = {
  firstName?: string | null;
  fullName?: string | null;
  id: string;
};

// Teacher Dashboard Component
const TeacherDashboard = ({ 
  user, 
  convexUser: _convexUser, // eslint-disable-line @typescript-eslint/no-unused-vars
  walkthroughs,
  teacherRecord
}: { 
  user: ClerkUser; 
  convexUser: ConvexUser; 
  walkthroughs: WalkthroughDoc[] | undefined; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  teacherRecord: any;
}) => {
  const safeWalkthroughs = walkthroughs ?? [];
  
  // Get coach information if available (removing unused variable)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const coach = useQuery(
    api.users.getUserById,
    teacherRecord?.coachId ? { userId: teacherRecord.coachId } : "skip"
  );

  const recentWalkthroughs = safeWalkthroughs
    .sort((a, b) => b.walkthroughDate - a.walkthroughDate)
    .slice(0, 3);

  return (
    <div className="space-y-6 relative">
      <GridDistortion />

      {/* Main Header */}
      <PageHeader
        title="Dashboard"
        description={
          <>
            Welcome back, <AnimatedGradientText className="font-semibold">{user.firstName || user.fullName || "Teacher"}</AnimatedGradientText>! Ready to continue your professional growth journey?
          </>
        }
      />

      {/* Recent Walkthroughs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Walkthroughs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentWalkthroughs.length > 0 ? (
              <div className="space-y-4">
                {recentWalkthroughs.map((walkthrough) => (
                  <Link 
                    key={walkthrough._id} 
                    href={`/walkthrough/${walkthrough._id}/view`}
                    className="block"
                  >
                    <div className="p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">Classroom Walkthrough</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            walkthrough.status === "completed" 
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-accent/10 text-accent-foreground border border-accent/20"
                          }`}>
                            {walkthrough.status === "completed" ? "Completed" : "In Progress"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(walkthrough.walkthroughDate).toLocaleDateString()}
                        </p>
                        {walkthrough.status === "completed" && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                              <Award className="h-3 w-3" />
                              {getIndicatorName(walkthrough.reinforcementIndicator)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                              <Target className="h-3 w-3" />
                              {getIndicatorName(walkthrough.refinementIndicator)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No walkthroughs yet</p>
                <p className="text-sm">Your coach will schedule walkthroughs soon</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Tilted Card Component
const TiltedCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn("relative", className)}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      style={{ zIndex: 1 }}
    >
      {children}
    </motion.div>
  );
};

// Grid Distortion Background
const GridDistortion = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid grid-cols-12 gap-1 opacity-5">
        {Array.from({ length: 144 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-primary/10 rounded-sm"
            whileHover={{
              scale: 1.2,
              backgroundColor: "rgba(var(--primary), 0.15)",
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function DashboardPage() {
  const { user } = useUser();
  const { isLoading, isAuthenticated, user: convexUser } = useAuthRedirect();

  // Determine user role and appropriate data fetching - must be done before hooks
  const userRole = convexUser?.role;
  
  // ALL HOOKS MUST BE CALLED AT THE TOP - before any early returns
  // For teachers, get their teacher record
  const teacherRecord = useQuery(
    api.teachers.getByUserClerkId,
    userRole === "teacher" && user ? { clerkId: user.id } : "skip"
  );

  // Determine the correct IDs for data fetching
  const coachId = userRole === "coach" ? convexUser?._id : convexUser?.coachId;
  const teacherId = teacherRecord?._id;

  // Fetch data based on user role
  const teachers = useQuery(
    api.teachers.list,
    coachId && userRole === "coach" ? { coachId } : "skip"
  );
  
  // For coaches: get all walkthroughs for their teachers
  // For teachers: get only their own walkthroughs
  const coachWalkthroughs = useQuery(
    api.walkthroughs.listByCoach,
    coachId && userRole === "coach" ? { coachId } : "skip"
  );
  const teacherWalkthroughs = useQuery(
    api.walkthroughs.listByTeacher,
    teacherId && userRole === "teacher" ? { teacherId } : "skip"
  );

  // Get walkthrough entries for coaches to show recent feedback
  const walkthroughEntries = useQuery(
    api.walkthroughEntries.listByTeacher,
    teacherId && userRole === "teacher" ? { teacherId } : "skip"
  );

  // For coaches, we need to get entries across all their teachers' walkthroughs
  const coachWalkthroughEntries = useQuery(
    api.walkthroughEntries.listByCoach,
    coachId && userRole === "coach" ? { coachId } : "skip"
  );

  // Use appropriate walkthroughs based on role
  const walkthroughs = userRole === "coach" ? coachWalkthroughs : teacherWalkthroughs;
  const entries = userRole === "coach" ? coachWalkthroughEntries : walkthroughEntries;

  // NOW we can do early returns after all hooks are called
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect is happening
  }

  // Type guard to ensure we have proper user data
  if (!user || !convexUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render appropriate dashboard based on role
  if (userRole === "teacher") {
    return (
      <TeacherDashboard 
        user={user} 
        convexUser={convexUser} 
        walkthroughs={walkthroughs}
        teacherRecord={teacherRecord}
      />
    );
  }

  // Default to coach dashboard
  if (teachers === undefined || walkthroughs === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const safeTeachers = teachers ?? [];
  const safeWalkthroughs = walkthroughs ?? [];

  // Calculate walkthrough stats
  const totalWalkthroughs = safeWalkthroughs.length;
  const completedWalkthroughs = safeWalkthroughs.filter(
    (w) => w.status === "completed",
  ).length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const inProgressWalkthroughs = safeWalkthroughs.filter(
    (w) => w.status === "draft",
  ).length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const completionRate =
    totalWalkthroughs > 0
      ? (completedWalkthroughs / totalWalkthroughs) * 100
      : 0;

  // Calculate coaching stats for the banner
  const thisMonthWalkthroughs = safeWalkthroughs.filter(w => {
    const walkthroughDate = new Date(w.walkthroughDate);
    const now = new Date();
    return walkthroughDate.getMonth() === now.getMonth() && 
           walkthroughDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 relative">
      <GridDistortion />

      {/* Main Header */}
      <PageHeader
        title="Dashboard"
        description={
          <>
            Welcome back, <AnimatedGradientText className="font-semibold">{user?.firstName || user?.fullName || "Coach"}</AnimatedGradientText>! Ready to support your teachers&apos; professional growth?
          </>
        }
        rightContent={
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{safeTeachers.length} Teachers</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{thisMonthWalkthroughs} This Month</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{completedWalkthroughs} Completed</span>
            </div>
          </div>
        }
      />

      {/* Teacher Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Teacher Status Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Quick visual priority system for your teachers</p>
          </CardHeader>
          <CardContent>
            {safeTeachers.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">On Track</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-muted-foreground">Needs Attention Soon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground">Immediate Action Required</span>
                  </div>
                </div>
                
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {safeTeachers.map((teacher) => {
                    const teacherWalkthroughs = safeWalkthroughs.filter(w => w.teacherId === teacher._id);
                    const lastWalkthrough = teacherWalkthroughs
                      .sort((a, b) => b.walkthroughDate - a.walkthroughDate)[0];
                    
                    // Calculate days using calendar days instead of 24-hour periods
                    const daysSinceLastWalkthrough = lastWalkthrough 
                      ? Math.floor((new Date().setHours(0,0,0,0) - new Date(lastWalkthrough.walkthroughDate).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
                      : null;
                    const hasDraft = teacherWalkthroughs.some(w => w.status === "draft");

                    // Determine status based on priority system
                    let status: 'green' | 'yellow' | 'red' = 'green';
                    let statusText = 'On Track';
                    let statusDetail = 'Recent observation completed';

                    if (daysSinceLastWalkthrough === null) {
                      status = 'red';
                      statusText = 'No Observations';
                      statusDetail = 'Schedule first walkthrough';
                    } else if (hasDraft) {
                      status = 'red';
                      statusText = 'Draft Pending';
                      statusDetail = 'Complete walkthrough draft';
                    } else if (daysSinceLastWalkthrough > 30) {
                      status = 'red';
                      statusText = 'Overdue';
                      statusDetail = `${daysSinceLastWalkthrough} days since last observation`;
                    } else if (daysSinceLastWalkthrough > 14) {
                      status = 'yellow';
                      statusText = 'Due Soon';
                      statusDetail = `${daysSinceLastWalkthrough} days since last observation`;
                    } else {
                      statusDetail = `${daysSinceLastWalkthrough} days since last observation`;
                    }

                    const statusColors = {
                      green: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20',
                      yellow: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20',
                      red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                    };

                    const dotColors = {
                      green: 'bg-green-500',
                      yellow: 'bg-yellow-500',
                      red: 'bg-red-500'
                    };

                    const textColors = {
                      green: 'text-green-700 dark:text-green-300',
                      yellow: 'text-yellow-700 dark:text-yellow-300',
                      red: 'text-red-700 dark:text-red-300'
                    };

                    return (
                      <div key={teacher._id} className={`p-4 border rounded-lg transition-colors hover:bg-accent/20 ${statusColors[status]}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{teacher.name}</h4>
                          <div className={`w-3 h-3 rounded-full ${dotColors[status]}`}></div>
                        </div>
                        <div className="space-y-1">
                          <p className={`text-sm font-medium ${textColors[status]}`}>
                            {statusText}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {statusDetail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teachers assigned yet</p>
                <p className="text-sm">Add teachers to start conducting walkthroughs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Feedback Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Feedback Highlights</CardTitle>
            <p className="text-sm text-muted-foreground">Latest AI-generated insights across your teachers</p>
          </CardHeader>
          <CardContent>
            {entries && entries.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  // Group entries by teacher
                  const teacherGroups = entries
                    .filter(entry => entry.aiFeedback && (entry.type === "reinforcement" || entry.type === "refinement"))
                    .reduce((groups, entry) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const teacherName = (entry as any).teacherName || "Unknown Teacher";
                      if (!groups[teacherName]) {
                        groups[teacherName] = [];
                      }
                      groups[teacherName].push(entry);
                      return groups;
                    }, {} as Record<string, typeof entries>);

                  // Convert to array and sort by most recent
                  return Object.entries(teacherGroups)
                    .map(([teacherName, teacherEntries]) => ({
                      teacherName,
                      entries: teacherEntries.sort((a, b) => b.createdAt - a.createdAt),
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      mostRecentDate: Math.max(...teacherEntries.map(e => (e as any).walkthroughDate || e.createdAt))
                    }))
                    .sort((a, b) => b.mostRecentDate - a.mostRecentDate)
                    .slice(0, 4)
                    .map(({ teacherName, entries: teacherEntries }) => (
                      <div key={teacherName} className="p-4 border border-border rounded-lg bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{teacherName}</h4>
                            <div className="flex flex-wrap gap-1">
                              {teacherEntries.slice(0, 2).map((entry) => (
                                <span key={entry._id} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                                  entry.type === "reinforcement"
                                    ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 border-green-200 dark:border-green-800"
                                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                }`}>
                                  {entry.type === "reinforcement" ? (
                                    <Award className="h-3 w-3" />
                                  ) : (
                                    <Target className="h-3 w-3" />
                                  )}
                                  {entry.indicatorAcronym}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(teacherEntries[0] as any).walkthroughDate ? 
                              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                              new Date((teacherEntries[0] as any).walkthroughDate).toLocaleDateString() : 
                              new Date(teacherEntries[0].createdAt).toLocaleDateString()
                            }
                          </span>
                        </div>
                        <div className="space-y-2">
                          {teacherEntries.slice(0, 2).map((entry) => (
                            <p key={entry._id} className="text-sm text-foreground leading-relaxed">
                              <span className={`font-medium ${
                                entry.type === "reinforcement" ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"
                              }`}>
                                {entry.type === "reinforcement" ? "Reinforcement" : "Refinement"}:
                              </span>{" "}
                              {entry.aiFeedback}
                            </p>
                          ))}
                        </div>
                      </div>
                    ));
                })()}
                {entries.filter(entry => entry.aiFeedback && (entry.type === "reinforcement" || entry.type === "refinement")).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No feedback highlights yet</p>
                    <p className="text-sm">Complete walkthroughs to see AI-generated insights</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback available</p>
                <p className="text-sm">Complete walkthroughs to see AI-generated insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Drafts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
      </motion.div>
    </div>
  );
}
