"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Edit, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import PgpGoalSettingForm from "./PgpGoalSettingForm";
import Modal from "@/components/mage-ui/modal";
import { toast } from "sonner";

interface PgpGoalCardProps {
  teacherId: string;
  teacherName: string;
  teacherSubject: string[];
  teacherGradeBand: string;
}

export function PgpGoalCard({
  teacherId,
  teacherName,
  teacherSubject,
  teacherGradeBand,
}: PgpGoalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const pgpGoal = useQuery(api.teachers.getPgpGoal, { teacherId: teacherId as Id<"teachers"> });
  

  const updateProgress = useMutation(api.teachers.updatePgpProgress);

  const handleProgressUpdate = async (newProgress: number) => {
    try {
      await updateProgress({
        teacherId: teacherId as Id<"teachers">,
        progress: newProgress,
      });
      toast.success("Progress updated successfully!");
    } catch (error) {
      toast.error("Failed to update progress");
      console.error("Error updating progress:", error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    if (progress >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 80) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (progress >= 60) return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    if (progress >= 40) return <Minus className="w-4 h-4 text-orange-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (pgpGoal === undefined) {
    // Query is still loading
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5" />
            Professional Growth Plan
          </CardTitle>
          <CardDescription>
            Loading...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pgpGoal === null) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              Professional Growth Plan
            </CardTitle>
            <CardDescription>
              No PGP goal set for {teacherName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              Set PGP Goal
            </Button>
          </CardContent>
        </Card>

        {/* PGP Goal Setting Modal */}
        <Modal
          isOpen={isModalOpen}
          onOpenChange={(open) => setIsModalOpen(open)}
          modalSize="lg"
        >
          <PgpGoalSettingForm
            teacherId={teacherId}
            teacherName={teacherName}
            teacherSubject={teacherSubject}
            teacherGradeBand={teacherGradeBand}
            onSuccess={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                Professional Growth Plan
              </CardTitle>
              <CardDescription>
                Goal set on {pgpGoal ? formatDate(pgpGoal.setAt) : 'Unknown'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Goal Text */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Goal</h4>
            <p className="text-sm leading-relaxed">{pgpGoal?.text || 'No goal text'}</p>
          </div>

          {/* Indicator Badge */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Focus Indicator</h4>
            <Badge variant="secondary" className="text-xs">
              {pgpGoal?.indicatorCode || 'No indicator'}
            </Badge>
          </div>

          {/* Progress Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-muted-foreground">Progress</h4>
              <div className="flex items-center gap-1">
                {getProgressIcon(pgpGoal?.progress || 0)}
                <span className={`text-sm font-medium ${getProgressColor(pgpGoal?.progress || 0)}`}>
                  {pgpGoal?.progress || 0}%
                </span>
              </div>
            </div>
            <Progress value={pgpGoal?.progress || 0} className="h-2" />
            
            {/* Quick Progress Update Buttons */}
            <div className="flex gap-2 mt-3">
              {[25, 50, 75, 100].map((progress) => (
                <Button
                  key={progress}
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressUpdate(progress)}
                  className="text-xs px-2 py-1 h-7"
                >
                  {progress}%
                </Button>
              ))}
            </div>
          </div>

          {/* Context Notes */}
          {pgpGoal?.contextNotes && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Context Notes</h4>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{pgpGoal.contextNotes}&rdquo;
              </p>
            </div>
          )}

          {/* Target Date */}
          {pgpGoal?.targetDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Target: {formatDate(pgpGoal.targetDate)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PGP Goal Setting Modal */}
      <Modal
        isOpen={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
        modalSize="lg"
      >
        <PgpGoalSettingForm
          teacherId={teacherId}
          teacherName={teacherName}
          teacherSubject={teacherSubject}
          teacherGradeBand={teacherGradeBand}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
          existingGoal={pgpGoal}
        />
      </Modal>
    </>
  );
} 