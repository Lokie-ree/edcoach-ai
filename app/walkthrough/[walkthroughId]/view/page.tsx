"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { PageHeader } from "@/components/layout/PageHeader";
import { 
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Clock,
  Award,
  Target,
  FileText
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
  const { user, isLoaded } = useUser();
  
  // Get current user data
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip"
  );

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

  // Get teacher info for coaches (to find the specific teacher from their list)
  const teacher = useQuery(
    api.teachers.list,
    convexUser?.role === "coach" ? {} : "skip"
  );

  // Get the current user's teacher record if they are a teacher
  const myTeacherRecord = useQuery(
    api.teachers.getMyRecord,
    convexUser?.role === "teacher" ? {} : "skip"
  );

  // Find the specific teacher from the list (for coaches) or use current user's record (for teachers)
  const specificTeacher = convexUser?.role === "coach" 
    ? teacher?.find(t => t._id === walkthrough?.teacherId)
    : myTeacherRecord;

  // Get observer info
  const observer = useQuery(
    api.users.getById,
    walkthrough ? { userId: walkthrough.observerId } : "skip"
  );

  // Show loading while authentication or core data is loading
  if (!isLoaded || (user && convexUser === undefined) || !walkthrough) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !convexUser) {
    return null;
  }

  // For teachers, we need to wait for their teacher record to load before checking permissions
  if (convexUser.role === "teacher" && myTeacherRecord === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For coaches, we need to wait for the teacher list to load
  if (convexUser.role === "coach" && teacher === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check permissions - teachers can only view their own walkthroughs, coaches can view their teachers' walkthroughs
  const hasPermission = convexUser.role === "coach" || 
    (convexUser.role === "teacher" && specificTeacher && walkthrough.teacherId === specificTeacher._id);

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
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Classroom Walkthrough"
        description={`Professional development observation for ${specificTeacher?.name || "teacher"}`}
        gradient={true}
        rightContent={
          convexUser.role === "coach" ? (
            <Link href={`/walkthrough/${walkthroughId}`}>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                Edit Walkthrough
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Subtle Walkthrough Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="relative overflow-hidden bg-card border-border/30 hover:border-border/50 transition-all duration-300">
          <CardHeader className="relative z-10 pb-4">
            <CardTitle className="flex items-center gap-3 text-foreground">
              <div className="p-1.5 rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <span className="text-lg font-medium text-foreground">
                  Walkthrough Overview
                </span>
                <p className="text-xs text-muted-foreground font-normal mt-1">
                  Participant information and observation details
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Teacher Information */}
              <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100/50 dark:bg-blue-900/20">
                    <User className="h-3.5 w-3.5 text-blue-600/70 dark:text-blue-400/70" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground">Teacher</h3>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-base font-medium text-foreground">
                    {specificTeacher?.name || "Loading..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {specificTeacher?.subject?.join(", ") || ""} • {specificTeacher?.gradeBand ? 
                      (() => {
                        const gradeBandLabels = {
                          "elementary": "Elementary",
                          "middle": "Middle School",
                          "high": "High School"
                        };
                        return gradeBandLabels[specificTeacher.gradeBand as keyof typeof gradeBandLabels] || specificTeacher.gradeBand;
                      })() : ""
                    }
                  </p>
                </div>
              </div>

              {/* Observer Information */}
              <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-100/50 dark:bg-purple-900/20">
                    <BookOpen className="h-3.5 w-3.5 text-purple-600/70 dark:text-purple-400/70" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground">Observer</h3>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-base font-medium text-foreground">
                    {observer?.name || "Loading..."}
                  </p>
                  <p className="text-xs text-muted-foreground">Coach</p>
                </div>
              </div>

              {/* Date Information */}
              <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/20 md:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-green-100/50 dark:bg-green-900/20">
                    <Calendar className="h-3.5 w-3.5 text-green-600/70 dark:text-green-400/70" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground">Observation Date</h3>
                </div>
                <div className="pl-6">
                  <p className="text-base font-medium text-foreground">
                    {new Date(walkthrough.walkthroughDate).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback Sections */}
      {walkthrough.status === "completed" && (
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Reinforcement */}
          <Card className="border-green-200 dark:border-green-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <BorderBeam
              duration={6}
              size={200}
              colorFrom="#10B981"
              colorTo="#059669"
            />
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
          <Card className="border-blue-200 dark:border-blue-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <BorderBeam
              duration={6}
              size={200}
              colorFrom="#3B82F6"
              colorTo="#1D4ED8"
            />
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
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-yellow-200 dark:border-yellow-800 relative overflow-hidden">
            <BorderBeam
              duration={6}
              size={200}
              colorFrom="#F59E0B"
              colorTo="#D97706"
            />
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Draft Walkthrough</h3>
              <p className="text-muted-foreground">
                This walkthrough is still in draft mode. Feedback will be available once it&apos;s completed.
              </p>
              {convexUser.role === "coach" && (
                <Link href={`/walkthrough/${walkthroughId}`} className="mt-4 inline-block">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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