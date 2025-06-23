"use client";

import React, { useState, useEffect } from "react";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConvexUser, ClerkUser } from "../types";
import QuickActionsPanel from "./QuickActionsPanel";
import TeacherStatusOverview from "./TeacherStatusOverview";
import RecentFeedbackHighlights from "./RecentFeedbackHighlights";
import CoachDashboardHeaderStats from "./CoachDashboardHeaderStats";
import { AIUsageBadge, AIUsageWarning } from "@/components/ui/ai-usage-badge";
import CoachTutorial from "@/components/onboarding/coach-tutorial";

interface CoachDashboardPageContentProps {
  user: ClerkUser;
  convexUser: ConvexUser;
  clerkOrganizationId: string;
}

export default function CoachDashboardPageContent({ 
  user, 
  convexUser,
  clerkOrganizationId
}: CoachDashboardPageContentProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial for new coaches (created within last 5 minutes and first time on dashboard)
  useEffect(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const isNewUser = convexUser.createdAt > fiveMinutesAgo;
    
    // Check if tutorial was already shown
    const tutorialShown = localStorage.getItem(`coach-tutorial-shown-${convexUser._id}`);
    
    if (isNewUser && !tutorialShown) {
      setShowTutorial(true);
    }
  }, [convexUser]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem(`coach-tutorial-shown-${convexUser._id}`, 'true');
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem(`coach-tutorial-shown-${convexUser._id}`, 'true');
  };

  return (
    <>
      <div className="space-y-6 relative">
        {/* Main Header */}
        <PageHeader
          title="Dashboard"
          description={
            <>
              Welcome back, <AnimatedGradientText className="font-semibold">{user?.firstName || user?.fullName || "Coach"}</AnimatedGradientText>! Ready to support your teachers&apos; professional growth?
            </>
          }
          gradient={true}
          rightContent={
            <div className="flex items-center gap-4">
              <AIUsageBadge showDetails />
              <CoachDashboardHeaderStats organizationId={clerkOrganizationId} />
            </div>
          }
        />

        {/* AI Usage Warning */}
        <AIUsageWarning />

        {/* Quick Actions Panel */}
        <QuickActionsPanel />

        {/* Teacher Status Overview */}
        <TeacherStatusOverview organizationId={clerkOrganizationId} />

        {/* Recent Feedback Highlights */}
        <RecentFeedbackHighlights organizationId={clerkOrganizationId} />
      </div>

      {/* Coach Tutorial Modal */}
      {showTutorial && (
        <CoachTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </>
  );
} 