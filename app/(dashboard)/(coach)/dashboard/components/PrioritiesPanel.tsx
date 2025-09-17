"use client";

import { Clock, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ANIMATIONS, STATUS_COLORS, ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface Priority {
  label: string;
  count: number;
  href: string;
  urgency: "high" | "medium" | "low";
  icon: React.ReactNode;
}

interface PrioritiesPanelProps {
  priorities: {
    walkthroughsDue: number;
    reflectionsToReview: number;
    teachersNeedingSupport: number;
  };
}

export function PrioritiesPanel({ priorities }: PrioritiesPanelProps) {
  const priorityItems: Priority[] = [
    {
      label: "Teachers Needing Walkthrough",
      count: priorities.walkthroughsDue,
      href: "/walkthrough/new",
      urgency: priorities.walkthroughsDue > 3 ? "high" : priorities.walkthroughsDue > 0 ? "medium" : "low",
      icon: <Clock className={ICONS.sizes.md} />,
    },
    {
      label: "New Reflections to Review",
      count: priorities.reflectionsToReview,
      href: "/teachers",
      urgency: priorities.reflectionsToReview > 5 ? "high" : priorities.reflectionsToReview > 0 ? "medium" : "low",
      icon: <CheckCircle className={ICONS.sizes.md} />,
    },
    {
      label: "Teachers Needing Support",
      count: priorities.teachersNeedingSupport,
      href: "/teachers",
      urgency: priorities.teachersNeedingSupport > 2 ? "high" : priorities.teachersNeedingSupport > 0 ? "medium" : "low",
      icon: <Users className={ICONS.sizes.md} />,
    },
  ];

  const getUrgencyStyles = (urgency: Priority["urgency"]) => {
    switch (urgency) {
      case "high":
        return cn(STATUS_COLORS.error.bg, STATUS_COLORS.error.border, STATUS_COLORS.error.text);
      case "medium":
        return cn(STATUS_COLORS.warning.bg, STATUS_COLORS.warning.border, STATUS_COLORS.warning.text);
      case "low":
        return cn(STATUS_COLORS.success.bg, STATUS_COLORS.success.border, STATUS_COLORS.success.text);
    }
  };

  const getCountStyles = (urgency: Priority["urgency"]) => {
    switch (urgency) {
      case "high":
        return cn(STATUS_COLORS.error.bg, STATUS_COLORS.error.text);
      case "medium":
        return cn(STATUS_COLORS.warning.bg, STATUS_COLORS.warning.text);
      case "low":
        return cn(STATUS_COLORS.success.bg, STATUS_COLORS.success.text);
    }
  };

  const hasActivePriorities = priorityItems.some((item) => item.count > 0);

  const activePriorityItems = priorityItems.filter((item) => item.count > 0);
  const totalActionItems = activePriorityItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className={ICONS.semantic.header} />
          Action Items
          {totalActionItems > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalActionItems}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasActivePriorities ? (
          <div className="text-center py-4">
            <CheckCircle className={cn("mx-auto mb-2", ICONS.sizes.xl, STATUS_COLORS.success.text)} />
            <p className={cn("text-sm font-medium", STATUS_COLORS.success.text)}>All caught up!</p>
            <p className={cn("text-xs mt-1", STATUS_COLORS.success.text)}>
              No urgent action items right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePriorityItems
              .sort((a, b) => {
                const urgencyOrder = { high: 3, medium: 2, low: 1 };
                return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
              })
              .map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4",
                    ANIMATIONS.classes.normal,
                    getUrgencyStyles(item.urgency)
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs opacity-75">
                        {item.urgency === "high" && "Immediate attention needed"}
                        {item.urgency === "medium" && "Follow up when convenient"}
                        {item.urgency === "low" && "Monitor progress"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full text-sm font-bold",
                      ICONS.sizes.lg, // Using lg size (w-6 h-6) instead of hardcoded w-8 h-8
                      getCountStyles(item.urgency)
                    )}
                  >
                    {item.count}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}