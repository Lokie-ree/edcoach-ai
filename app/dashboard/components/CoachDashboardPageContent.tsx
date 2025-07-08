"use client";

import React, { useState, useEffect } from "react";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConvexUser, ClerkUser } from "../types";
import TeacherStatusOverview from "./TeacherStatusOverview";
import RecentFeedbackHighlights from "./RecentFeedbackHighlights";
import CoachDashboardHeaderStats from "./CoachDashboardHeaderStats";
import { AIUsageWarning } from "@/components/ui/ai-usage-badge";
import CoachTutorial from "@/components/onboarding/coach-tutorial";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePlanDetection } from "@/lib/usePlanDetection";

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
          rightContent={
            <CoachDashboardHeaderStats
              aiUsage={aiUsage}
              hasProPlan={hasProPlan}
              hasStarterPlan={hasStarterPlan}
            />
          }
        />

        {/* Usage Warnings - These will show upgrade prompts when needed */}
        <AIUsageWarning />

        {/* Dashboard Stats and Content */}
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
