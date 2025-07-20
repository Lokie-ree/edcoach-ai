import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PrioritiesPanelProps {
  walkthroughsDue: number;
  reflectionsToReview: number;
  teachersNeedingSupport: number;
}

export function PrioritiesPanel({
  walkthroughsDue,
  reflectionsToReview,
  teachersNeedingSupport,
}: PrioritiesPanelProps) {
  const priorities = [
    {
      title: "Walkthroughs Due",
      count: walkthroughsDue,
      icon: Calendar,
      color: "bg-blue-500",
      action: "Schedule Now",
      href: "/walkthrough/new",
    },
    {
      title: "Reflections to Review",
      count: reflectionsToReview,
      icon: FileText,
      color: "bg-green-500",
      action: "Review",
      href: "/walkthrough", // This will show walkthroughs with reflections
    },
    {
      title: "Teachers Needing Support",
      count: teachersNeedingSupport,
      icon: Users,
      color: "bg-orange-500",
      action: "Check In",
      href: "/teachers", // This will show teachers list
    },
  ];

  return (
    <Card className="h-full">
      {" "}
      {/* Ensure consistent height */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Priority Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {" "}
        {/* Reduced spacing */}
        {priorities.map((priority) => (
          <div
            key={priority.title}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${priority.color}`}>
                <priority.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium">{priority.title}</p>
                <p className="text-sm text-muted-foreground">
                  {priority.count} {priority.count === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <Link href={priority.href}>
              <Button variant="outline" size="sm">
                {priority.action}
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
