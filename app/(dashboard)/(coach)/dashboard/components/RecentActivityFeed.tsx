import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  FileText,
  MessageSquare,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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

// Mobile-optimized activity item component
function ActivityItem({
  activity,
  index,
}: {
  activity: ActivityItem;
  index: number;
}) {
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
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "generated":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={activity.href || "#"} className="block">
        <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer touch-manipulation min-h-[64px] active:bg-muted/70">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="text-xs font-medium">
              {activity.teacherName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 rounded-full bg-muted/50">
                {getActivityIcon(activity.type)}
              </div>
              <span className="font-medium text-sm truncate">
                {activity.teacherName}
              </span>
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-0.5 ${getStatusColor(activity.status)}`}
              >
                {activity.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {activity.title}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(activity.timestamp)}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-60" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📱</div>
        <p className="text-sm text-muted-foreground mb-1">
          No recent activity yet
        </p>
        <p className="text-xs text-muted-foreground">
          Complete your first walkthrough to see activity here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <ActivityItem key={activity.id} activity={activity} index={index} />
      ))}
    </div>
  );
}
