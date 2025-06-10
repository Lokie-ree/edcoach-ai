"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { getIndicatorName } from "@/lib/indicator-utils";

export default function ViewWalkthroughPage({ 
  params 
}: { 
  params: Promise<{ walkthroughId: string }> 
}) {
  const { walkthroughId } = React.use(params);

  const { isLoading, isAuthenticated, user: convexUser } = useAuthRedirect();

  // Get walkthrough details
  const walkthrough = useQuery(
    api.walkthroughs.getById,
    { walkthroughId: walkthroughId as Id<"walkthroughs"> }
  );

  // Get walkthrough entries (feedback)
  const walkthroughEntries = useQuery(
    api.walkthroughEntries.listByWalkthrough,
    { walkthroughId: walkthroughId as Id<"walkthroughs"> }
  );

  // Get teacher info
  const teacher = useQuery(
    api.teachers.getById,
    walkthrough ? { teacherId: walkthrough.teacherId } : "skip"
  );

  // Get observer info
  const observer = useQuery(
    api.users.getUserById,
    walkthrough ? { userId: walkthrough.observerId } : "skip"
  );

  // Show loading while authentication or core data is loading
  if (isLoading || !isAuthenticated || !convexUser || !walkthrough) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For teachers, we need to wait for teacher data to load before checking permissions
  if (convexUser.role === "teacher" && teacher === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check permissions - teachers can only view their own walkthroughs, coaches can view their teachers' walkthroughs
  const hasPermission = convexUser.role === "coach" || 
    (convexUser.role === "teacher" && teacher && walkthrough.teacherId === teacher._id);

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">
          {walkthrough ? "Access Denied" : "Walkthrough Not Found"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {walkthrough 
            ? "You don't have permission to view this walkthrough."
            : "The walkthrough you're looking for doesn't exist."
          }
        </p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const reinforcementEntry = walkthroughEntries?.find(e => e.type === "reinforcement");
  const refinementEntry = walkthroughEntries?.find(e => e.type === "refinement");

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={convexUser.role === "teacher" ? "/my-walkthroughs" : "/dashboard"}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {convexUser.role === "teacher" ? "My Walkthroughs" : "Dashboard"}
              </Button>
            </Link>
            <Badge variant={walkthrough.status === "completed" ? "default" : "secondary"}>
              {walkthrough.status === "completed" ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Classroom Walkthrough
          </h1>
          <p className="text-muted-foreground mt-2">
            {new Date(walkthrough.walkthroughDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        {convexUser.role === "coach" && (
          <Link href={`/walkthrough/${walkthroughId}`}>
            <Button>
              Edit Walkthrough
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teacher</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{teacher?.name || "Loading..."}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {teacher?.subject?.join(", ") || ""} • {teacher?.gradeLevels?.join(", ") || ""}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Observer</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{observer?.name || "Loading..."}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Coach
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {new Date(walkthrough.walkthroughDate).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Observation date
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback Sections */}
      {walkthrough.status === "completed" && (
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Reinforcement */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Award className="h-5 w-5" />
                Reinforcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Indicator</p>
                  <p className="font-medium">{getIndicatorName(walkthrough.reinforcementIndicator)}</p>
                </div>
                {reinforcementEntry?.aiFeedback && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {reinforcementEntry.aiFeedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Refinement */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Target className="h-5 w-5" />
                Refinement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Indicator</p>
                  <p className="font-medium">{getIndicatorName(walkthrough.refinementIndicator)}</p>
                </div>
                {refinementEntry?.aiFeedback && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {refinementEntry.aiFeedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Draft Message */}
      {walkthrough.status === "draft" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Draft Walkthrough</h3>
              <p className="text-muted-foreground">
                This walkthrough is still in draft mode. Feedback will be available once it&apos;s completed.
              </p>
              {convexUser.role === "coach" && (
                <Link href={`/walkthrough/${walkthroughId}`} className="mt-4 inline-block">
                  <Button>
                    Complete Walkthrough
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
} 