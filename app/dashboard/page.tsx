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
  BarChart,
  BookOpen,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { WalkthroughDraftsList } from "@/components/walkthrough-drafts-list";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Id } from "@/convex/_generated/dataModel";

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

type ClerkUser = {
  firstName?: string | null;
  fullName?: string | null;
  id: string;
};

// Teacher Dashboard Component
const TeacherDashboard = ({ 
  user, 
  convexUser, 
  walkthroughs 
}: { 
  user: ClerkUser; 
  convexUser: ConvexUser; 
  walkthroughs: WalkthroughDoc[] | undefined; 
}) => {
  const safeWalkthroughs = walkthroughs ?? [];
  
  // Calculate teacher-specific stats
  const totalWalkthroughs = safeWalkthroughs.length;
  const completedWalkthroughs = safeWalkthroughs.filter(
    (w) => w.status === "completed",
  ).length;
  const recentWalkthroughs = safeWalkthroughs
    .sort((a, b) => b.walkthroughDate - a.walkthroughDate)
    .slice(0, 3);

  return (
    <div className="space-y-6 relative">
      <GridDistortion />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Teacher Dashboard
        </h1>
        <p className="text-foreground mt-2">
          Welcome, {" "}
          <AnimatedGradientText>
            {user.firstName || user.fullName || "Teacher"}
          </AnimatedGradientText>.
        </p>
      </motion.div>

      {/* Teacher Quick Actions */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TiltedCard className="md:col-span-2">
          <Card className="h-full bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 border hover:bg-muted/50"
                  disabled
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">View My Walkthroughs</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 border hover:bg-muted/50"
                  disabled
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">My Progress</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 border hover:bg-muted/50"
                  disabled
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Action Plans</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TiltedCard>
      </motion.div>

      {/* Teacher Stats */}
      <motion.div
        className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TiltedCard>
          <Card className="h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Walkthroughs
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {totalWalkthroughs}
              </div>
              <p className="text-xs text-foreground mt-2 md:mt-3">
                Classroom walkthroughs completed
              </p>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                Completed
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {completedWalkthroughs}
              </div>
              <p className="text-xs text-foreground mt-2 md:mt-3">
                Walkthroughs with feedback
              </p>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                My Coach
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-medium text-foreground">
                {convexUser.coachId ? "Connected" : "Not Assigned"}
              </div>
              <p className="text-xs text-foreground mt-2 md:mt-3">
                Coach assignment status
              </p>
            </CardContent>
          </Card>
        </TiltedCard>
      </motion.div>

      {/* Recent Walkthroughs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Walkthroughs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentWalkthroughs.length > 0 ? (
              <div className="space-y-4">
                {recentWalkthroughs.map((walkthrough) => (
                  <div key={walkthrough._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Walkthrough</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(walkthrough.walkthroughDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        walkthrough.status === "completed" 
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {walkthrough.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </div>
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

  // Use appropriate walkthroughs based on role
  const walkthroughs = userRole === "coach" ? coachWalkthroughs : teacherWalkthroughs;

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
  const inProgressWalkthroughs = safeWalkthroughs.filter(
    (w) => w.status === "draft",
  ).length;
  const completionRate =
    totalWalkthroughs > 0
      ? (completedWalkthroughs / totalWalkthroughs) * 100
      : 0;

  return (
    <div className="space-y-6 relative">
      <GridDistortion />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-foreground mt-2">
          Welcome, {" "}
          <AnimatedGradientText>
          {user?.firstName}
          </AnimatedGradientText>.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Quick Actions */}
        <TiltedCard className="md:col-span-2">
          <Card className="h-full bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Quick Actions
              </CardTitle>
             
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Link href="/teachers">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 border hover:bg-muted/50"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Manage Teachers</span>
                  </Button>
                </Link>
                <Link href="/walkthrough/new">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 border hover:bg-muted/50"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      Start New Walkthrough
                    </span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 border hover:bg-muted/50"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">View Analytics</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TiltedCard>
      </motion.div>
      {/* Stats Grid */}
      <motion.div
        className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TiltedCard>
          <Card className="h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Teachers
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {safeTeachers.length}
              </div>
              <p className="text-xs text-foreground mt-2 md:mt-3">
                Teachers in your organization
              </p>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Walkthroughs
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {totalWalkthroughs}
              </div>
              <p className="text-xs text-foreground mt-2 md:mt-3">
                {completedWalkthroughs} completed, {inProgressWalkthroughs} in progress
              </p>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                Completion Rate
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {Math.round(completionRate)}%
              </div>
              <Progress value={completionRate} className="mt-2 md:mt-3" />
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                This Month
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <BarChart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {/* TODO: Calculate monthly stats */}
                {totalWalkthroughs}
              </div>
              <p className="text-xs text-foreground mt-2 md:mt-3">
                Walkthroughs completed
              </p>
            </CardContent>
          </Card>
        </TiltedCard>
      </motion.div>

      {/* Drafts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <WalkthroughDraftsList />
      </motion.div>
    </div>
  );
}
