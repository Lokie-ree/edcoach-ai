"use client";

import { Clock, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      label: "Draft Walkthroughs Due",
      count: priorities.walkthroughsDue,
      href: "/dashboard",
      urgency: priorities.walkthroughsDue > 3 ? "high" : priorities.walkthroughsDue > 0 ? "medium" : "low",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: "New Reflections to Review",
      count: priorities.reflectionsToReview,
      href: "/dashboard",
      urgency: priorities.reflectionsToReview > 5 ? "high" : priorities.reflectionsToReview > 0 ? "medium" : "low",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      label: "Teachers Needing Support",
      count: priorities.teachersNeedingSupport,
      href: "/teachers",
      urgency: priorities.teachersNeedingSupport > 2 ? "high" : priorities.teachersNeedingSupport > 0 ? "medium" : "low",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const getUrgencyStyles = (urgency: Priority["urgency"]) => {
    switch (urgency) {
      case "high":
        return "border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10";
      case "medium":
        return "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-950/30";
      case "low":
        return "border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300 dark:hover:bg-green-950/30";
    }
  };

  const getCountStyles = (urgency: Priority["urgency"]) => {
    switch (urgency) {
      case "high":
        return "bg-destructive/10 text-destructive";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300";
    }
  };

  const hasActivePriorities = priorityItems.some((item) => item.count > 0);

  const activePriorityItems = priorityItems.filter((item) => item.count > 0);
  const totalActionItems = activePriorityItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
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
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">All caught up!</p>
            <p className="text-xs text-green-600 mt-1 dark:text-green-400">
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
                  className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${getUrgencyStyles(
                    item.urgency
                  )}`}
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
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getCountStyles(
                      item.urgency
                    )}`}
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