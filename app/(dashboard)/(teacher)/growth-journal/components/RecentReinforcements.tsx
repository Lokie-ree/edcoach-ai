import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { Reinforcement } from "@/types/myProgress";
import { ICONS, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function RecentReinforcements({ recentReinforcements }: { recentReinforcements: Reinforcement[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className={cn(ICONS.semantic.header, STATUS_COLORS.success.text)} />
          Recent Reinforcements
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your recent strengths and positive feedback
        </p>
      </CardHeader>
      <CardContent>
        {recentReinforcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className={cn(ICONS.sizes.xl, "mx-auto mb-4 opacity-50")} />
            <p>No reinforcements yet</p>
            <p className="text-sm">Complete walkthroughs to see your positive feedback here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentReinforcements.map((reinforcement, index) => (
              <div key={`${reinforcement.indicator}-${reinforcement.walkthroughDate}-${index}`} className={cn("border-l-4 pl-4 py-2", STATUS_COLORS.success.border)}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm font-medium", STATUS_COLORS.success.text)}>
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