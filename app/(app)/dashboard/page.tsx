"use client";

import React from "react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  School,
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
import { useMutation, useQuery, Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { WalkthroughDraftsList } from "@/components/walkthrough-drafts-list";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

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
  return (
    <>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[400px]">
          <Button asChild variant="outline">
            <Link href="/sign-in">Sign in to access your dashboard</Link>
          </Button>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLoading>
    </>
  );
}

function DashboardContent() {
  const { user } = useUser();
  const upsertUser = useMutation(api.users.storeMetadata);

  // Upsert user in Convex on login
  React.useEffect(() => {
    if (user) {
      upsertUser({
        // Do not pass coachId here; let backend handle it
        preferences: user.publicMetadata?.preferences || {},
        role: "coach",
        name: user.fullName || user.username || user.id,
        email: user.primaryEmailAddress?.emailAddress || undefined,
        imageUrl: user.imageUrl || undefined,
      });
    }
  }, [user, upsertUser]);

  // Fetch Convex user doc by Clerk ID
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Use Convex user _id as coachId in all queries
  const coachId = convexUser?._id;

  const teachers = useQuery(
    api.teachers.list,
    coachId ? { coachId } : "skip"
  );
  const observations = useQuery(
    api.observations.list,
    coachId ? { coachId } : "skip"
  );

  if (!user || !convexUser || teachers === undefined || observations === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const safeTeachers = teachers ?? [];
  const safeObservations = observations ?? [];

  // Calculate observation stats
  const totalObservations = safeObservations.length;
  const completedObservations = safeObservations.filter(
    (o) => o.status === "completed",
  ).length;
  const inProgressObservations = safeObservations.filter(
    (o) => o.status === "draft",
  ).length;
  const completionRate =
    totalObservations > 0
      ? (completedObservations / totalObservations) * 100
      : 0;

  return (
    <div className="space-y-6 relative">
      <GridDistortion />

      {/* Debug: Organization Info */}
      {/* {organization && (
        <div className="p-4 mb-4 rounded bg-yellow-100 text-yellow-900 border border-yellow-300">
          <strong>Organization Debug Info:</strong><br />
          <span><b>ID:</b> {organization.id}</span><br />
          <span><b>Name:</b> {organization.name}</span>
        </div>
      )} */}

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
          {user.firstName}
          </AnimatedGradientText>.
          <br></br>
          Here&apos;s an overview of your organization.
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
              <CardDescription className="text-foreground">
                Common tasks you might want to perform
              </CardDescription>
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
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Observations
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {totalObservations}
              </div>
              <div className="flex items-center text-xs text-foreground mt-2 md:mt-3">
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-success mr-1"></div>
                  {completedObservations} completed
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-1"></div>
                  {inProgressObservations} in progress
                </span>
              </div>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="bg-card">
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
                {completionRate.toFixed(1)}%
              </div>
              <div className="mt-4 md:mt-6">
                <Progress
                  value={completionRate}
                  className="h-2 bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-foreground">
                School Info
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <School className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                1
              </div>
              <p className="text-xs text-foreground mt-2 md:mt-3">
                Schools in your network
              </p>
            </CardContent>
          </Card>
        </TiltedCard>
      </motion.div>
      {/* Walkthrough Drafts List */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Your Walkthrough Drafts</h2>
        <WalkthroughDraftsList />
      </div>
    </div>
  );
}
