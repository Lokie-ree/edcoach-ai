"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";

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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Engaged":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Needs Support":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Stable":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold">My Professional Growth Goal</span>
          </div>
          <Badge className={getTrendColor(pgpGoal.trend)}>
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