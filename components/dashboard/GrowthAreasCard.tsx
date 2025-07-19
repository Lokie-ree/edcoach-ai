import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { StrengthOrGrowth } from "@/types/myProgress";

export default function GrowthAreasCard({ growthAreas }: { growthAreas: StrengthOrGrowth[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Growth Areas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {growthAreas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No refinements yet</p>
            <p className="text-sm">Complete more walkthroughs to see growth opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {growthAreas.map((g) => (
              <div key={g.indicator} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{g.indicatorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={g.percent} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {g.count} time{g.count !== 1 ? "s" : ""}
                    </span>
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