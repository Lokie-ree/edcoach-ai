"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { ANIMATIONS, SPACING, STATUS_COLORS, RESPONSIVE_PATTERNS, ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface TeacherPgpGoalCardProps {
  pgpGoal: {
    title: string;
    description: string;
    progress: number;
    trend: "Needs Support" | "Engaged" | "Stable";
    targetDate?: string;
  };
}

export function TeacherPgpGoalCard({ pgpGoal }: TeacherPgpGoalCardProps) {
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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Engaged":
        return cn(STATUS_COLORS.success.bg, STATUS_COLORS.success.text);
      case "Needs Support":
        return cn(STATUS_COLORS.error.bg, STATUS_COLORS.error.text);
      case "Stable":
        return cn(STATUS_COLORS.info.bg, STATUS_COLORS.info.text);
      default:
        return cn(STATUS_COLORS.neutral.bg, STATUS_COLORS.neutral.text);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={cn(
      "border-2 transition-all hover:shadow-md",
      ANIMATIONS.classes.normal,
      "border-primary/20",
      "bg-gradient-to-r from-primary/5 to-primary/10"
    )}>
      <CardHeader className={cn("space-y-3", SPACING.component.md)}>
        <CardTitle className={cn("flex items-center justify-between", RESPONSIVE_PATTERNS.text.subheading)}>
          <div className="flex items-center gap-2">
            <Target className={cn("w-5 h-5", "text-primary", ICONS.semantic.header)} />
            <span className="font-semibold">My Professional Growth Goal</span>
          </div>
          <Badge className={cn("transition-all", ANIMATIONS.classes.normal, getTrendColor(pgpGoal.trend))}>
            {pgpGoal.trend}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal Title and Description */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-primary">
            {pgpGoal.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {pgpGoal.description}
          </p>
        </div>

        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-muted-foreground">Progress</h4>
            <div className="flex items-center gap-2">
              {getProgressIcon(pgpGoal.progress)}
              <span className={`text-lg font-bold ${getProgressColor(pgpGoal.progress)}`}>
                {pgpGoal.progress}%
              </span>
            </div>
          </div>
          <Progress value={pgpGoal.progress} className="h-3" />
        </div>

        {/* Target Date */}
        {pgpGoal.targetDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>Target completion: {formatDate(pgpGoal.targetDate)}</span>
          </div>
        )}

        {/* Motivational Message */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-sm text-primary font-medium">
            {pgpGoal.progress >= 80 
              ? "🎉 Excellent progress! You're almost there!" 
              : pgpGoal.progress >= 60 
              ? "🚀 Great momentum! Keep pushing forward!"
              : pgpGoal.progress >= 40
              ? "💪 Steady progress! Stay focused on your goal!"
              : "🌱 Every journey begins with a single step. You've got this!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}