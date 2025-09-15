"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Target, 
  Users, 
  TrendingUp,
  Calendar,
  ArrowRight
} from "lucide-react";
import { ANIMATIONS, SPACING, STATUS_COLORS, RESPONSIVE_PATTERNS, ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface PriorityItem {
  id: string;
  title: string;
  description: string;
  type: "urgent" | "important" | "overdue" | "upcoming";
  teacherName: string;
  dueDate?: string;
  progress?: number;
  status: "pending" | "in_progress" | "completed";
}

interface PrioritiesPanelProps {
  priorities?: PriorityItem[];
  className?: string;
}

export function PrioritiesPanel({ priorities = [], className }: PrioritiesPanelProps) {
  // Mock data for demonstration - in real app, this would come from props or API
  const mockPriorities: PriorityItem[] = [
    {
      id: "1",
      title: "Review Sarah's PGP Goal Progress",
      description: "Monthly check-in on Professional Growth Plan goal",
      type: "urgent",
      teacherName: "Sarah Martinez",
      dueDate: "Today",
      progress: 75,
      status: "in_progress"
    },
    {
      id: "2", 
      title: "Complete Walkthrough Feedback",
      description: "AI-generated feedback needs review and sending",
      type: "important",
      teacherName: "Michael Thompson",
      dueDate: "Tomorrow",
      progress: 60,
      status: "in_progress"
    },
    {
      id: "3",
      title: "Set New PGP Goals",
      description: "Three teachers need new goals for next quarter",
      type: "upcoming",
      teacherName: "Multiple Teachers",
      dueDate: "Next Week",
      progress: 0,
      status: "pending"
    },
    {
      id: "4",
      title: "Follow up on Reflection",
      description: "Teacher hasn't completed growth journal reflection",
      type: "overdue",
      teacherName: "Jennifer Lee",
      dueDate: "2 days ago",
      progress: 0,
      status: "pending"
    }
  ];

  const displayPriorities = priorities.length > 0 ? priorities : mockPriorities;

  const getPriorityIcon = (type: PriorityItem["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className={cn("w-4 h-4", STATUS_COLORS.error.text)} />;
      case "important":
        return <Target className={cn("w-4 h-4", STATUS_COLORS.warning.text)} />;
      case "overdue":
        return <Clock className={cn("w-4 h-4", STATUS_COLORS.error.text)} />;
      case "upcoming":
        return <Calendar className={cn("w-4 h-4", STATUS_COLORS.info.text)} />;
      default:
        return <Target className={cn("w-4 h-4", STATUS_COLORS.neutral.text)} />;
    }
  };

  const getPriorityBadgeVariant = (type: PriorityItem["type"]) => {
    switch (type) {
      case "urgent":
        return "destructive" as const;
      case "important":
        return "default" as const;
      case "overdue":
        return "destructive" as const;
      case "upcoming":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  const getStatusIcon = (status: PriorityItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className={cn("w-4 h-4", STATUS_COLORS.success.text)} />;
      case "in_progress":
        return <TrendingUp className={cn("w-4 h-4", STATUS_COLORS.info.text)} />;
      case "pending":
        return <Clock className={cn("w-4 h-4", STATUS_COLORS.neutral.text)} />;
      default:
        return <Clock className={cn("w-4 h-4", STATUS_COLORS.neutral.text)} />;
    }
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", ANIMATIONS.classes.normal, className)}>
      <CardHeader className={cn("space-y-3", SPACING.component.md)}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("flex items-center gap-2", RESPONSIVE_PATTERNS.text.subheading)}>
            <Target className={cn(ICONS.semantic.header)} />
            Priorities
          </CardTitle>
          <Button variant="outline" size="sm" className={cn("transition-all", ANIMATIONS.classes.normal)}>
            View All
            <ArrowRight className={cn("w-4 h-4 ml-1", ICONS.semantic.button)} />
          </Button>
        </div>
        <CardDescription className={cn(RESPONSIVE_PATTERNS.text.body)}>
          Your most important coaching tasks and deadlines
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-4", SPACING.component.md)}>
        {displayPriorities.length === 0 ? (
          <div className={cn(
            "text-center py-8",
            STATUS_COLORS.neutral.bg,
            "rounded-lg"
          )}>
            <CheckCircle2 className={cn("w-8 h-8 mx-auto mb-2 text-muted-foreground")} />
            <p className="text-sm text-muted-foreground">No pending priorities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayPriorities.map((priority) => (
              <div
                key={priority.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  ANIMATIONS.classes.normal,
                  "hover:shadow-sm cursor-pointer",
                  priority.type === "urgent" || priority.type === "overdue" 
                    ? STATUS_COLORS.error.bg 
                    : STATUS_COLORS.neutral.bg,
                  priority.type === "urgent" || priority.type === "overdue"
                    ? STATUS_COLORS.error.border
                    : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(priority.type)}
                    <h4 className={cn("font-medium text-sm", RESPONSIVE_PATTERNS.text.body)}>
                      {priority.title}
                    </h4>
                  </div>
                  <Badge 
                    variant={getPriorityBadgeVariant(priority.type)}
                    className="text-xs"
                  >
                    {priority.type}
                  </Badge>
                </div>
                
                <p className={cn("text-xs text-muted-foreground mb-3", RESPONSIVE_PATTERNS.text.body)}>
                  {priority.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Users className={cn("w-3 h-3", ICONS.semantic.inline)} />
                    <span>{priority.teacherName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className={cn("w-3 h-3", ICONS.semantic.inline)} />
                    <span>{priority.dueDate}</span>
                  </div>
                </div>
                
                {priority.progress !== undefined && priority.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span className={cn(
                        priority.progress >= 80 ? STATUS_COLORS.success.text : 
                        priority.progress >= 50 ? STATUS_COLORS.warning.text : 
                        STATUS_COLORS.error.text
                      )}>
                        {priority.progress}%
                      </span>
                    </div>
                    <Progress 
                      value={priority.progress} 
                      className={cn("h-2 transition-all", ANIMATIONS.classes.normal)}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(priority.status)}
                    <span className="text-xs capitalize">{priority.status.replace("_", " ")}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn("h-7 px-2 text-xs transition-all", ANIMATIONS.classes.normal)}
                  >
                    Take Action
                    <ArrowRight className={cn("w-3 h-3 ml-1", ICONS.semantic.button)} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
