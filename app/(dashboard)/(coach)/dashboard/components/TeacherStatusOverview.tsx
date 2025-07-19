"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { TeacherInvitationForm } from "@/app/(dashboard)/(coach)/teachers/components/TeacherInvitationForm";

export default function TeacherStatusOverview() {
  // UPDATED: Use coach-based teacher queries instead of organization-based
  const teachers = useQuery(api.teachers.list);
  const invitations = useQuery(api.invitations.listMyInvitations);

  if (teachers === undefined || invitations === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Teaching Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine teachers and pending invitations for comprehensive view
  const activeTeachers = teachers.filter((t) => t.status === "active");
  const pendingTeachers = teachers.filter(
    (t) => t.status === "pending" || t.status === "needs_details",
  );
  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  const totalTeamSize = teachers.length + pendingInvitations.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "needs_details":
        return (
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-800 dark:border-orange-700 dark:text-orange-200"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Setup Needed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Teaching Team
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{totalTeamSize} Total</Badge>
            <TeacherInvitationForm
              trigger={
                <Button size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {activeTeachers.length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Active
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {pendingTeachers.length}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Setup Needed
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {pendingInvitations.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Invited
            </div>
          </div>
        </div>

        {/* Teacher List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Team Members
          </h4>

          {/* Active Teachers */}
          {activeTeachers.slice(0, 3).map((teacher) => (
            <div
              key={teacher._id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {teacher.email}
                  </p>
                </div>
              </div>
              {getStatusBadge(teacher.status)}
            </div>
          ))}

          {/* Pending Invitations */}
          {pendingInvitations.slice(0, 2).map((invitation) => (
            <div
              key={invitation._id}
              className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {invitation.teacherEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Invitation Pending
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {invitation.teacherEmail}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-blue-300 text-blue-800 dark:border-blue-700 dark:text-blue-200"
              >
                <Clock className="h-3 w-3 mr-1" />
                Sent{" "}
                {Math.floor(
                  (Date.now() - invitation.createdAt) / (24 * 60 * 60 * 1000),
                )}
                d ago
              </Badge>
            </div>
          ))}

          {/* Empty State */}
          {totalTeamSize === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No teachers yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building your coaching team by inviting teachers
              </p>
              <TeacherInvitationForm />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
