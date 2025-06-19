"use client";

import React from "react";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConvexUser, ClerkUser } from "../types";
import QuickActionsPanel from "./QuickActionsPanel";
import TeacherStatusOverview from "./TeacherStatusOverview";
import RecentFeedbackHighlights from "./RecentFeedbackHighlights";
import CoachDashboardHeaderStats from "./CoachDashboardHeaderStats";

interface CoachDashboardPageContentProps {
  user: ClerkUser;
  convexUser: ConvexUser;
  clerkOrganizationId: string;
}

export default function CoachDashboardPageContent({ 
  user, 
  convexUser: _convexUser, // eslint-disable-line @typescript-eslint/no-unused-vars
  clerkOrganizationId
}: CoachDashboardPageContentProps) {

  return (
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
        rightContent={<CoachDashboardHeaderStats organizationId={clerkOrganizationId} />}
      />

      {/* Quick Actions Panel */}
      <QuickActionsPanel organizationId={clerkOrganizationId} />

      {/* Teacher Status Overview */}
      <TeacherStatusOverview organizationId={clerkOrganizationId} />

      {/* Recent Feedback Highlights */}
      <RecentFeedbackHighlights organizationId={clerkOrganizationId} />
    </div>
  );
} 