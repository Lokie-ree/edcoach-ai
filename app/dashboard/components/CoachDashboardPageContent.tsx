"use client";

import React, { useState, useEffect } from "react";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConvexUser, ClerkUser } from "../types";
import TeacherStatusOverview from "./TeacherStatusOverview";
import RecentFeedbackHighlights from "./RecentFeedbackHighlights";
import { AIUsageWarning } from "@/components/ui/ai-usage-badge";
import CoachTutorial from "@/components/onboarding/coach-tutorial";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePlanDetection } from "@/lib/usePlanDetection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, BarChart2, CreditCard } from "lucide-react";
import Link from "next/link";
import { AIUsageBadge, TeacherUsageBadge } from "@/components/ui/ai-usage-badge";

interface CoachDashboardPageContentProps {
  user: ClerkUser;
  convexUser: ConvexUser;
}

export default function CoachDashboardPageContent({
  user,
  convexUser,
}: CoachDashboardPageContentProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Use personal plan detection instead of organization-level checks
  const planDetection = usePlanDetection();
  const hasProPlan = planDetection.isProPlan;
  const hasStarterPlan = planDetection.isStarterPlan;
  // Get AI usage for the correct plan
  const aiUsage = useQuery(
    api.plans.getAIUsageThisMonth,
    convexUser?.role === "coach" ? { hasProPlan, hasStarterPlan } : "skip",
  );

  // Get analytics for simplified display
  const analytics = useQuery(api.analytics.getCoachAnalytics);

  // Show tutorial for new coaches (created within last 5 minutes and first time on dashboard)
  useEffect(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const isNewUser = convexUser.createdAt > fiveMinutesAgo;

    // Check if tutorial was already shown
    const tutorialShown = localStorage.getItem(
      `coach-tutorial-shown-${convexUser._id}`,
    );

    if (isNewUser && !tutorialShown) {
      setShowTutorial(true);
    }
  }, [convexUser]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem(`coach-tutorial-shown-${convexUser._id}`, "true");
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem(`coach-tutorial-shown-${convexUser._id}`, "true");
  };

  return (
    <>
      <div className="space-y-6 relative">
        {/* Main Header */}
        <PageHeader
          title="Dashboard"
          description={
            <>
              Welcome back,{" "}
              <AnimatedGradientText className="font-semibold">
                {user?.firstName || user?.fullName || "Coach"}
              </AnimatedGradientText>
              ! Ready to support your teachers&apos; professional growth?
            </>
          }
          gradient={true}
        />

        {/* Hero Action Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Text Content - Left Side */}
                <div className="text-center lg:text-left lg:flex-1">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                    Ready to conduct a walkthrough?
                  </h2>
                  <p className="text-muted-foreground text-base lg:text-lg max-w-2xl">
                    Capture classroom observations and generate AI-powered feedback to support your teachers&apos; professional growth
                  </p>
                </div>
                
                {/* Action Elements - Right Side */}
                <div className="flex flex-col items-center gap-4 lg:items-end">
                  {/* Usage Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <TeacherUsageBadge
                      showDetails
                      hasProPlan={hasProPlan}
                      hasStarterPlan={hasStarterPlan}
                    />
                    <AIUsageBadge
                      showDetails
                      aiUsage={aiUsage}
                      hasProPlan={hasProPlan}
                      hasStarterPlan={hasStarterPlan}
                    />
                  </div>
                  
                  {/* Primary Action Button */}
                  <Link href="/walkthrough/new">
                    <Button size="lg" className="gap-2 px-6 py-3 text-base">
                      <BookOpen className="h-5 w-5" />
                      New Walkthrough
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Warnings - These will show upgrade prompts when needed */}
        <AIUsageWarning />

        {/* Quick Navigation - Enhanced for larger screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Link href="/teachers">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Teachers</h3>
                      <p className="text-sm text-muted-foreground">
                        {analytics ? `${analytics.totalTeachers} active team members` : "Manage your team"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Performance insights & trends
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/billing">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Billing</h3>
                      <p className="text-sm text-muted-foreground">
                        {hasProPlan ? "Pro Plan Active" : hasStarterPlan ? "Starter Plan Active" : "Free Plan"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Stats and Content - Enhanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Status Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TeacherStatusOverview />
          </motion.div>

          {/* Recent Feedback Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <RecentFeedbackHighlights />
          </motion.div>
        </div>
      </div>

      {/* Coach Tutorial */}
      {showTutorial && (
        <CoachTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </>
  );
}
