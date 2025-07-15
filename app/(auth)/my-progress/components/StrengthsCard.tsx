import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";
import { StrengthOrGrowth } from "@/types/myProgress";

export default function StrengthsCard({ strengths }: { strengths: StrengthOrGrowth[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-green-500" />
          Your Strengths
        </CardTitle>
      </CardHeader>
      <CardContent>
        {strengths.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reinforcements yet</p>
            <p className="text-sm">Complete more walkthroughs to see your strengths</p>
          </div>
        ) : (
          <div className="space-y-4">
            {strengths.map((s) => (
              <div key={s.indicator} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{s.indicatorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={s.percent} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {s.count} time{s.count !== 1 ? "s" : ""}
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