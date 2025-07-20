"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { PgpGoalCard } from "@/app/(dashboard)/(coach)/teachers/components/PgpGoalCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeacherDetailsPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  const teacher = useQuery(api.teachers.getTeacherById, { teacherId: teacherId as Id<"teachers"> });
  const teacherAnalytics = useQuery(api.analytics.getTeacherPgpData, { teacherId: teacherId as Id<"teachers"> });

  if (!teacher) {
    return (
      <div className="py-3 md:py-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-3">
          <Skeleton className="h-64" />
          <div className="xl:col-span-2 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 md:py-4 space-y-4">
      {/* Page Header */}
      <PageHeader
        title={teacher.name}
        description={`Teacher Details • ${teacher.subject.join(", ")} • ${teacher.gradeBand}`}
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/walkthrough/new?teacherId=${teacherId}`}>
          <Button>
            <BookOpen className="w-4 h-4 mr-2" />
            Start Walkthrough
          </Button>
        </Link>
        <Link href={`/teachers/${teacherId}/walkthroughs`}>
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            View Walkthroughs
          </Button>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-3">
        {/* PGP Goal Card - Takes 1/3 on large screens */}
        <div className="xl:col-span-1">
          <PgpGoalCard
            teacherId={teacherId}
            teacherName={teacher.name}
            teacherSubject={teacher.subject}
            teacherGradeBand={teacher.gradeBand}
          />
        </div>

        {/* Teacher Details and Analytics - Takes 2/3 on large screens */}
        <div className="xl:col-span-2 space-y-4">
          {/* Teacher Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Teacher Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
                  <p className="text-sm">{teacher.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                  <Badge 
                    variant={teacher.status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {teacher.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Subject(s)</h4>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subject.map((subject) => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Grade Band</h4>
                  <p className="text-sm">{teacher.gradeBand}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          {teacherAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Teaching Analytics
                </CardTitle>
                <CardDescription>
                  Overview of teaching performance and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{teacherAnalytics?.recentWalkthroughs?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Walkthroughs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{teacherAnalytics?.recentWalkthroughs?.filter(w => w.date > Date.now() - 30 * 24 * 60 * 60 * 1000).length || 0}</div>
                    <div className="text-sm text-muted-foreground">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{teacherAnalytics?.strengths?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Strengths</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{teacherAnalytics?.pgpGoal?.progress || 0}%</div>
                    <div className="text-sm text-muted-foreground">PGP Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
