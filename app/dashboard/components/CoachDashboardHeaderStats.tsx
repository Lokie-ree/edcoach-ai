"use client";

import React from "react";
import { Users, BookOpen, CheckCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CoachDashboardHeaderStatsProps {
  organizationId: string;
}

export default function CoachDashboardHeaderStats({ organizationId }: CoachDashboardHeaderStatsProps) {
  // Fetch teachers directly
  const teachers = useQuery(
    api.teachers.list,
    {}
  );
  
  const walkthroughs = useQuery(
    api.walkthroughs.listByOrg,
    { clerkOrganizationId: organizationId }
  );

  // Only count active teachers
  const activeTeachers = (teachers ?? []).filter(teacher => teacher.status === "active");
  const safeWalkthroughs = walkthroughs ?? [];

  // Calculate stats
  const completedWalkthroughs = safeWalkthroughs.filter(
    (w) => w.status === "completed"
  ).length;

  const thisMonthWalkthroughs = safeWalkthroughs.filter(w => {
    const walkthroughDate = new Date(w.walkthroughDate);
    const now = new Date();
    return walkthroughDate.getMonth() === now.getMonth() && 
           walkthroughDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="hidden md:flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-foreground font-medium">{activeTeachers.length} Teachers</span>
      </div>
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-foreground font-medium">{thisMonthWalkthroughs} This Month</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-primary" />
        <span className="text-foreground font-medium">{completedWalkthroughs} Completed</span>
      </div>
    </div>
  );
} 