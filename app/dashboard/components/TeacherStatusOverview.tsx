"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface TeacherStatusOverviewProps {
  organizationId: string;
}

// Status configuration constants
const STATUS_THRESHOLDS = {
  OVERDUE_DAYS: 30,
  DUE_SOON_DAYS: 14,
} as const;

const STATUS_CONFIG = {
  green: {
    colors: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20',
    dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-300',
  },
  yellow: {
    colors: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20',
    dot: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  red: {
    colors: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
  },
} as const;

type StatusType = keyof typeof STATUS_CONFIG;

interface TeacherStatus {
  status: StatusType;
  statusText: string;
  statusDetail: string;
}

function calculateTeacherStatus(
  teacherWalkthroughs: any[],
  daysSinceLastWalkthrough: number | null
): TeacherStatus {
  if (daysSinceLastWalkthrough === null) {
    return {
      status: 'red',
      statusText: 'No Observations',
      statusDetail: 'Schedule first walkthrough',
    };
  }

  const hasDraft = teacherWalkthroughs.some(w => w.status === "draft");
  
  if (hasDraft) {
    return {
      status: 'red',
      statusText: 'Draft Pending',
      statusDetail: 'Complete walkthrough draft',
    };
  }

  if (daysSinceLastWalkthrough > STATUS_THRESHOLDS.OVERDUE_DAYS) {
    return {
      status: 'red',
      statusText: 'Overdue',
      statusDetail: `${daysSinceLastWalkthrough} days since last observation`,
    };
  }

  if (daysSinceLastWalkthrough > STATUS_THRESHOLDS.DUE_SOON_DAYS) {
    return {
      status: 'yellow',
      statusText: 'Due Soon',
      statusDetail: `${daysSinceLastWalkthrough} days since last observation`,
    };
  }

  return {
    status: 'green',
    statusText: 'On Track',
    statusDetail: `${daysSinceLastWalkthrough} days since last observation`,
  };
}

function calculateDaysSinceLastWalkthrough(walkthroughDate: number): number {
  return Math.floor(
    (new Date().setHours(0, 0, 0, 0) - new Date(walkthroughDate).setHours(0, 0, 0, 0)) /
    (1000 * 60 * 60 * 24)
  );
}

export default function TeacherStatusOverview({ organizationId }: TeacherStatusOverviewProps) {
  // Fetch organization members with their teacher data
  const orgMembers = useQuery(
    api.organizationMembers.getOrgMembersWithTeacherData,
    { clerkOrganizationId: organizationId }
  );
  
  const walkthroughs = useQuery(
    api.walkthroughs.listByOrg,
    { clerkOrganizationId: organizationId }
  );

  // Filter to only show members who have teacher data (are teachers)
  const teachers = (orgMembers ?? []).filter(member => member.teacherId && member.role === "teacher");
  const safeWalkthroughs = walkthroughs ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Teacher Status Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick visual priority system for your teachers
          </p>
        </CardHeader>
        <CardContent>
          {teachers.length > 0 ? (
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">On Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-muted-foreground">Needs Attention Soon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-muted-foreground">Immediate Action Required</span>
                </div>
              </div>
              
              {/* Teacher Status Cards */}
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {teachers.map((teacher) => {
                  const teacherWalkthroughs = safeWalkthroughs.filter(
                    w => w.teacherId === teacher.teacherId
                  );
                  const lastWalkthrough = teacherWalkthroughs
                    .sort((a, b) => b.walkthroughDate - a.walkthroughDate)[0];
                  
                  const daysSinceLastWalkthrough = lastWalkthrough 
                    ? calculateDaysSinceLastWalkthrough(lastWalkthrough.walkthroughDate)
                    : null;

                  const { status, statusText, statusDetail } = calculateTeacherStatus(
                    teacherWalkthroughs,
                    daysSinceLastWalkthrough
                  );

                  const config = STATUS_CONFIG[status];

                  return (
                    <div 
                      key={teacher._id} 
                      className={`p-4 border rounded-lg transition-colors hover:bg-accent/20 ${config.colors}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{teacher.teacherData?.name || teacher.name}</h4>
                        <div className={`w-3 h-3 rounded-full ${config.dot}`}></div>
                      </div>
                      <div className="space-y-1">
                        <p className={`text-sm font-medium ${config.text}`}>
                          {statusText}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {statusDetail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teachers assigned yet</p>
              <p className="text-sm">Add teachers to start conducting walkthroughs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 