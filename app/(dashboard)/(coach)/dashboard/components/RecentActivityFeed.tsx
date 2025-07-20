import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, FileText, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  type: "walkthrough" | "reflection" | "feedback";
  teacherName: string;
  timestamp: number;
  status: string;
  title: string;
  href?: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "walkthrough":
        return <BookOpen className="h-4 w-4" />;
      case "reflection":
        return <FileText className="h-4 w-4" />;
      case "feedback":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "generated":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <Card className="h-full">
      {" "}
      {/* Ensure consistent height */}
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {" "}
        {/* Reduced spacing */}
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={activity.href || "#"}
            className="block"
          >
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {activity.teacherName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <span className="font-medium text-sm">
                    {activity.teacherName}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getStatusColor(activity.status)}`}
                  >
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {activity.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
