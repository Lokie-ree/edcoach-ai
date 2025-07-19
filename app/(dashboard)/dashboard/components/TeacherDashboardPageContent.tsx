"use client";

import React, { useState, useEffect } from "react";
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
  BarChart,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { getIndicatorName } from "@/lib/IndicatorUtils";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/common/PageHeader";
import { ClerkUser, ConvexUser, TeacherRecord } from "@/types/user";
import TeacherTutorial from "@/app/onboarding/components/TeacherTutorial";
import { Button } from "@/components/ui/button";

interface TeacherDashboardPageContentProps {
  user: ClerkUser;
  convexUser: ConvexUser;
  teacherRecord: TeacherRecord;
}

export default function TeacherDashboardPageContent({ 
  user, 
  convexUser,
  teacherRecord
}: TeacherDashboardPageContentProps) {
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);

  // Fetch teacher-specific data
  const walkthroughs = useQuery(
    api.walkthroughs.listByTeacher,
    teacherRecord?._id ? { teacherId: teacherRecord._id } : "skip"
  );

  const safeWalkthroughs = walkthroughs ?? [];
  
  const recentWalkthroughs = safeWalkthroughs
    .sort((a, b) => b.walkthroughDate - a.walkthroughDate)
    .slice(0, 3);

  // Show tutorial for new teachers (created within 5 minutes) who haven't completed it
  useEffect(() => {
    if (convexUser && teacherRecord) {
      const userCreatedAt = convexUser.createdAt;
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      // Check if tutorial was already shown/completed
      const tutorialShown = localStorage.getItem(`teacher-tutorial-shown-${convexUser._id}`);
      
      // Show tutorial if user was created within the last 5 minutes AND hasn't seen tutorial
      if (userCreatedAt > fiveMinutesAgo && !tutorialShown) {
        setShowTutorial(true);
      }
    }
  }, [convexUser, teacherRecord]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    // Mark tutorial as completed
    if (convexUser) {
      localStorage.setItem(`teacher-tutorial-shown-${convexUser._id}`, 'true');
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    // Mark tutorial as completed even if skipped
    if (convexUser) {
      localStorage.setItem(`teacher-tutorial-shown-${convexUser._id}`, 'true');
    }
  };

  return (
    <>
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

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Navigation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Access your professional development tools and progress
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* My Walkthroughs */}
                <Link href="/my-walkthroughs">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center p-6 space-y-3 w-full"
                  >
                    <BookOpen className="h-8 w-8 text-primary" />
                    <span className="text-base font-medium">My Walkthroughs</span>
                    <span className="text-sm text-muted-foreground text-center">
                      View all classroom observations
                    </span>
                  </Button>
                </Link>

                {/* My Progress */}
                <Link href="/my-progress">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center p-6 space-y-3 w-full"
                  >
                    <BarChart className="h-8 w-8 text-primary" />
                    <span className="text-base font-medium">My Progress</span>
                    <span className="text-sm text-muted-foreground text-center">
                      Track your growth over time
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Walkthroughs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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

      {/* Teacher Tutorial Modal */}
      {showTutorial && (
        <TeacherTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </>
  );
} 