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
  BookOpen,
  Award,
  Target,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { getIndicatorName } from "@/lib/indicator-utils";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConvexUser, TeacherRecord, ClerkUser } from "../types";

interface TeacherDashboardPageContentProps {
  user: ClerkUser;
  convexUser: ConvexUser;
  teacherRecord: TeacherRecord;
}

export default function TeacherDashboardPageContent({ 
  user, 
  convexUser: _convexUser, // eslint-disable-line @typescript-eslint/no-unused-vars
  teacherRecord
}: TeacherDashboardPageContentProps) {
  // Fetch teacher-specific data
  const walkthroughs = useQuery(
    api.walkthroughs.listByTeacher,
    teacherRecord?._id ? { teacherId: teacherRecord._id } : "skip"
  );

  // Get coach information if available (removing unused variable)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const coach = useQuery(
    api.users.getUserById,
    teacherRecord?.coachId ? { userId: teacherRecord.coachId } : "skip"
  );

  const safeWalkthroughs = walkthroughs ?? [];
  
  const recentWalkthroughs = safeWalkthroughs
    .sort((a, b) => b.walkthroughDate - a.walkthroughDate)
    .slice(0, 3);

  return (
    <div className="space-y-6 relative">
      {/* Main Header */}
      <PageHeader
        title="Dashboard"
        description={
          <>
            Welcome back, <AnimatedGradientText className="font-semibold">{user.firstName || user.fullName || "Teacher"}</AnimatedGradientText>! Ready to continue your professional growth journey?
          </>
        }
        gradient={true}
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
} 