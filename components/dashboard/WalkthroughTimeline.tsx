import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Calendar, Eye } from "lucide-react";

interface WalkthroughItem {
  id: string;
  date: number;
  indicators: string[];
  hasReflection: boolean;
  title: string;
  status: string;
}

interface WalkthroughTimelineProps {
  walkthroughs: WalkthroughItem[];
}

export function WalkthroughTimeline({
  walkthroughs,
}: WalkthroughTimelineProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recent Walkthroughs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {walkthroughs.map((walkthrough) => (
          <div
            key={walkthrough.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{walkthrough.title}</span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getStatusColor(walkthrough.status)}`}
                >
                  {walkthrough.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(walkthrough.date)}
                </div>
                {walkthrough.hasReflection && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Reflection
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">
                  Indicators:
                </span>
                {walkthrough.indicators.map((indicator, index) => (
                  <Badge
                    key={`${indicator}-${index}`}
                    variant="outline"
                    className="text-xs"
                  >
                    {indicator}
                  </Badge>
                ))}
              </div>

              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
