"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Edit, Calendar, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import PgpGoalSettingForm from "./PgpGoalSettingForm";
import Modal from "@/components/mage-ui/modal";
import { toast } from "sonner";
import { ANIMATIONS, SPACING, STATUS_COLORS, RESPONSIVE_PATTERNS, ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { LoadingState, LoadingStateVariants } from "@/components/common/LoadingState";

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
    if (progress >= 80) return STATUS_COLORS.success.text;
    if (progress >= 60) return STATUS_COLORS.warning.text;
    if (progress >= 40) return STATUS_COLORS.warning.text;
    return STATUS_COLORS.error.text;
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 80) return <TrendingUp className={cn("w-4 h-4", STATUS_COLORS.success.text)} />;
    if (progress >= 60) return <TrendingUp className={cn("w-4 h-4", STATUS_COLORS.warning.text)} />;
    if (progress >= 40) return <Minus className={cn("w-4 h-4", STATUS_COLORS.warning.text)} />;
    return <TrendingDown className={cn("w-4 h-4", STATUS_COLORS.error.text)} />;
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
      <LoadingStateVariants.Card isLoading={true}>
        <Card className={cn("transition-all", ANIMATIONS.classes.normal)}>
          <CardHeader className={cn("space-y-3", SPACING.component.md)}>
            <CardTitle className={cn("flex items-center gap-2", RESPONSIVE_PATTERNS.text.subheading)}>
              <Target className={cn(ICONS.semantic.header)} />
              Professional Growth Plan
            </CardTitle>
            <CardDescription className={cn(RESPONSIVE_PATTERNS.text.body)}>
              Loading...
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("space-y-4", SPACING.component.md)}>
            <div className="space-y-3">
              <div className="h-4 w-3/4" />
              <div className="h-8 w-full" />
              <div className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </LoadingStateVariants.Card>
    );
  }

  if (pgpGoal === null) {
    return (
      <>
        <Card className={cn("transition-all hover:shadow-md", ANIMATIONS.classes.normal)}>
          <CardHeader className={cn("space-y-3", SPACING.component.md)}>
            <CardTitle className={cn("flex items-center gap-2", RESPONSIVE_PATTERNS.text.subheading)}>
              <Target className={cn(ICONS.semantic.header)} />
              Professional Growth Plan
            </CardTitle>
            <CardDescription className={cn(RESPONSIVE_PATTERNS.text.body)}>
              No PGP goal set for {teacherName}
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("space-y-4", SPACING.component.md)}>
            <div className={cn(
              "p-4 rounded-lg border-2 border-dashed text-center",
              STATUS_COLORS.neutral.bg,
              STATUS_COLORS.neutral.border
            )}>
              <Sparkles className={cn("w-8 h-8 mx-auto mb-2 text-muted-foreground")} />
              <p className="text-sm text-muted-foreground mb-4">
                Set a Professional Growth Plan goal to track {teacherName}'s development
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className={cn(
                  "w-full h-12 transition-all",
                  ANIMATIONS.classes.normal,
                  "hover:bg-primary/90"
                )}
              >
                <Target className={cn("w-4 h-4 mr-2", ICONS.semantic.button)} />
                Set PGP Goal
              </Button>
            </div>
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
      <Card className={cn("transition-all hover:shadow-md", ANIMATIONS.classes.normal)}>
        <CardHeader className={cn("space-y-3", SPACING.component.md)}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className={cn("flex items-center gap-2", RESPONSIVE_PATTERNS.text.subheading)}>
                <Target className={cn(ICONS.semantic.header)} />
                Professional Growth Plan
              </CardTitle>
              <CardDescription className={cn(RESPONSIVE_PATTERNS.text.body)}>
                Goal set on {pgpGoal ? formatDate(pgpGoal.setAt) : 'Unknown'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "transition-all",
                ANIMATIONS.classes.normal,
                "hover:bg-accent"
              )}
            >
              <Edit className={cn("w-4 h-4 mr-2", ICONS.semantic.button)} />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className={cn("space-y-6", SPACING.component.md)}>
          {/* Goal Text */}
          <div className="space-y-2">
            <h4 className={cn("font-medium text-sm text-muted-foreground", RESPONSIVE_PATTERNS.text.body)}>
              Goal
            </h4>
            <p className={cn("text-sm leading-relaxed", RESPONSIVE_PATTERNS.text.body)}>
              {pgpGoal?.text || 'No goal text'}
            </p>
          </div>

          {/* Indicator Badge */}
          <div className="space-y-2">
            <h4 className={cn("font-medium text-sm text-muted-foreground", RESPONSIVE_PATTERNS.text.body)}>
              Focus Indicator
            </h4>
            <Badge 
              variant="secondary" 
              className={cn("text-xs transition-all", ANIMATIONS.classes.normal)}
            >
              {pgpGoal?.indicatorCode || 'No indicator'}
            </Badge>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={cn("font-medium text-sm text-muted-foreground", RESPONSIVE_PATTERNS.text.body)}>
                Progress
              </h4>
              <div className="flex items-center gap-2">
                {getProgressIcon(pgpGoal?.progress || 0)}
                <span className={cn("text-sm font-medium", getProgressColor(pgpGoal?.progress || 0))}>
                  {pgpGoal?.progress || 0}%
                </span>
              </div>
            </div>
            <Progress 
              value={pgpGoal?.progress || 0} 
              className={cn("h-3 transition-all", ANIMATIONS.classes.normal)} 
            />
            
            {/* Quick Progress Update Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[25, 50, 75, 100].map((progress) => (
                <Button
                  key={progress}
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressUpdate(progress)}
                  className={cn(
                    "text-xs px-3 py-1 h-8 transition-all",
                    ANIMATIONS.classes.normal,
                    "hover:bg-accent"
                  )}
                >
                  {progress}%
                </Button>
              ))}
            </div>
          </div>

          {/* Context Notes */}
          {pgpGoal?.contextNotes && (
            <div className={cn("space-y-2 p-3 rounded-lg", STATUS_COLORS.info.bg, STATUS_COLORS.info.border, "border")}>
              <h4 className={cn("font-medium text-sm text-muted-foreground", RESPONSIVE_PATTERNS.text.body)}>
                Context Notes
              </h4>
              <p className={cn("text-sm italic", RESPONSIVE_PATTERNS.text.body, STATUS_COLORS.info.text)}>
                &ldquo;{pgpGoal.contextNotes}&rdquo;
              </p>
            </div>
          )}

          {/* Target Date */}
          {pgpGoal?.targetDate && (
            <div className={cn("flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-md", STATUS_COLORS.neutral.bg)}>
              <Calendar className={cn("w-4 h-4", ICONS.semantic.inline)} />
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