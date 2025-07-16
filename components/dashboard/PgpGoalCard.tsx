import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, TrendingUp } from "lucide-react";

interface PgpGoalCardProps {
  title: string;
  description: string;
  progress: number;
  trend: "Needs Support" | "Engaged" | "Stable";
  targetDate: string;
}

export function PgpGoalCard({ title, description, progress, trend, targetDate }: PgpGoalCardProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Engaged":
        return "bg-green-100 text-green-800";
      case "Needs Support":
        return "bg-red-100 text-red-800";
      case "Stable":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Professional Growth Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant="secondary" className={getTrendColor(trend)}>
              {trend}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Target: {formatDate(targetDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 