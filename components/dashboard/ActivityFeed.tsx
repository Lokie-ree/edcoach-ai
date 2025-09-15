"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Target, 
  CheckCircle2, 
  Clock, 
  User, 
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";
import { ANIMATIONS, SPACING, STATUS_COLORS, RESPONSIVE_PATTERNS, ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "walkthrough" | "pgp_goal" | "reflection" | "feedback" | "milestone";
  title: string;
  description: string;
  teacherName: string;
  teacherAvatar?: string;
  timestamp: string;
  status: "completed" | "pending" | "in_progress";
  priority?: "high" | "medium" | "low";
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ activities = [], className }: ActivityFeedProps) {
  // Mock data for demonstration - in real app, this would come from props or API
  const mockActivities: ActivityItem[] = [
    {
      id: "1",
      type: "walkthrough",
      title: "Completed Classroom Observation",
      description: "Observed Sarah Martinez's math lesson on fractions",
      teacherName: "Sarah Martinez",
      teacherAvatar: "/avatars/sarah.jpg",
      timestamp: "2 hours ago",
      status: "completed",
      priority: "high"
    },
    {
      id: "2",
      type: "feedback",
      title: "AI Feedback Generated",
      description: "Generated feedback for Michael Thompson's walkthrough",
      teacherName: "Michael Thompson",
      teacherAvatar: "/avatars/michael.jpg",
      timestamp: "4 hours ago",
      status: "pending",
      priority: "medium"
    },
    {
      id: "3",
      type: "pgp_goal",
      title: "PGP Goal Set",
      description: "Set new Professional Growth Plan goal for Jennifer Lee",
      teacherName: "Jennifer Lee",
      teacherAvatar: "/avatars/jennifer.jpg",
      timestamp: "1 day ago",
      status: "completed",
      priority: "high"
    },
    {
      id: "4",
      type: "reflection",
      title: "Growth Journal Entry",
      description: "Teacher completed reflection on recent feedback",
      teacherName: "David Chen",
      teacherAvatar: "/avatars/david.jpg",
      timestamp: "2 days ago",
      status: "completed",
      priority: "medium"
    },
    {
      id: "5",
      type: "milestone",
      title: "Progress Milestone Reached",
      description: "Teacher achieved 80% progress on PGP goal",
      teacherName: "Sarah Martinez",
      teacherAvatar: "/avatars/sarah.jpg",
      timestamp: "3 days ago",
      status: "completed",
      priority: "high"
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "walkthrough":
        return <BookOpen className={cn("w-4 h-4", STATUS_COLORS.info.text)} />;
      case "pgp_goal":
        return <Target className={cn("w-4 h-4", STATUS_COLORS.success.text)} />;
      case "reflection":
        return <MessageSquare className={cn("w-4 h-4", STATUS_COLORS.warning.text)} />;
      case "feedback":
        return <Sparkles className={cn("w-4 h-4", STATUS_COLORS.info.text)} />;
      case "milestone":
        return <TrendingUp className={cn("w-4 h-4", STATUS_COLORS.success.text)} />;
      default:
        return <Clock className={cn("w-4 h-4", STATUS_COLORS.neutral.text)} />;
    }
  };

  const getStatusIcon = (status: ActivityItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className={cn("w-4 h-4", STATUS_COLORS.success.text)} />;
      case "in_progress":
        return <Clock className={cn("w-4 h-4", STATUS_COLORS.warning.text)} />;
      case "pending":
        return <Clock className={cn("w-4 h-4", STATUS_COLORS.neutral.text)} />;
      default:
        return <Clock className={cn("w-4 h-4", STATUS_COLORS.neutral.text)} />;
    }
  };

  const getPriorityBadgeVariant = (priority?: ActivityItem["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "default" as const;
      case "low":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", ANIMATIONS.classes.normal, className)}>
      <CardHeader className={cn("space-y-3", SPACING.component.md)}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("flex items-center gap-2", RESPONSIVE_PATTERNS.text.subheading)}>
            <Clock className={cn(ICONS.semantic.header)} />
            Recent Activity
          </CardTitle>
          <Button variant="outline" size="sm" className={cn("transition-all", ANIMATIONS.classes.normal)}>
            View All
            <ArrowRight className={cn("w-4 h-4 ml-1", ICONS.semantic.button)} />
          </Button>
        </div>
        <CardDescription className={cn(RESPONSIVE_PATTERNS.text.body)}>
          Latest updates from your coaching activities
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-4", SPACING.component.md)}>
        {displayActivities.length === 0 ? (
          <div className={cn(
            "text-center py-8",
            STATUS_COLORS.neutral.bg,
            "rounded-lg"
          )}>
            <Clock className={cn("w-8 h-8 mx-auto mb-2 text-muted-foreground")} />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayActivities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  ANIMATIONS.classes.normal,
                  "hover:shadow-sm cursor-pointer",
                  activity.status === "completed" 
                    ? STATUS_COLORS.success.bg 
                    : activity.status === "in_progress"
                    ? STATUS_COLORS.warning.bg
                    : STATUS_COLORS.neutral.bg,
                  activity.status === "completed" 
                    ? STATUS_COLORS.success.border 
                    : activity.status === "in_progress"
                    ? STATUS_COLORS.warning.border
                    : "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.teacherAvatar} />
                    <AvatarFallback className="text-xs">
                      {activity.teacherName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <h4 className={cn("font-medium text-sm", RESPONSIVE_PATTERNS.text.body)}>
                          {activity.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.priority && (
                          <Badge 
                            variant={getPriorityBadgeVariant(activity.priority)}
                            className="text-xs"
                          >
                            {activity.priority}
                          </Badge>
                        )}
                        {getStatusIcon(activity.status)}
                      </div>
                    </div>
                    
                    <p className={cn("text-xs text-muted-foreground mb-2", RESPONSIVE_PATTERNS.text.body)}>
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className={cn("w-3 h-3", ICONS.semantic.inline)} />
                        <span>{activity.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className={cn("w-3 h-3", ICONS.semantic.inline)} />
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
