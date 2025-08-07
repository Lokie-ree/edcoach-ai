import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { Reinforcement } from "@/types/myProgress";

export default function RecentReinforcements({ recentReinforcements }: { recentReinforcements: Reinforcement[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-green-500" />
          Recent Reinforcements
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your recent strengths and positive feedback
        </p>
      </CardHeader>
      <CardContent>
        {recentReinforcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reinforcements yet</p>
            <p className="text-sm">Complete walkthroughs to see your positive feedback here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentReinforcements.map((reinforcement, index) => (
              <div key={`${reinforcement.indicator}-${reinforcement.walkthroughDate}-${index}`} className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {reinforcement.indicatorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reinforcement.walkthroughDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {reinforcement.aiFeedback}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 