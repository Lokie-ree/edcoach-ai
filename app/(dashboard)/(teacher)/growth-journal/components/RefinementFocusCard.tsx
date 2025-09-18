import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { ICONS, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface RefinementFocusCardProps {
  currentIndicator: string;
  description: string;
  progress: number;
  nextSteps: string[];
  aiInsights?: {
    trendAnalysis: string;
    strategicRecommendations: string[];
    progressPrediction: string;
  };
}

export function RefinementFocusCard({ 
  currentIndicator, 
  description, 
  progress, 
  nextSteps,
  aiInsights
}: RefinementFocusCardProps) {
  const getProgressColor = () => {
    if (progress >= 75) return STATUS_COLORS.success.text;
    if (progress >= 50) return STATUS_COLORS.warning.text;
    if (progress >= 25) return STATUS_COLORS.warning.text;
    return STATUS_COLORS.error.text;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className={ICONS.semantic.header} />
          Current Focus Area
          {aiInsights && (
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className={cn(ICONS.sizes.xs, "mr-1")} />
              AI Insights
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {currentIndicator}
          </Badge>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Implementation Progress</span>
            <span className={`font-medium ${getProgressColor()}`}>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {aiInsights && (
          <div className={cn("bg-gradient-to-r p-4 rounded-lg border", STATUS_COLORS.info.bg, STATUS_COLORS.info.border)}>
            <div className="space-y-3">
              {/* Trend Analysis */}
              <div>
                <h4 className="font-medium text-sm text-info mb-1 flex items-center gap-1">
                  <TrendingUp className={ICONS.sizes.xs} />
                  Trend Analysis
                </h4>
                <p className={cn("text-sm", STATUS_COLORS.info.text)}>{aiInsights.trendAnalysis}</p>
              </div>

              {/* Progress Prediction */}
              <div>
                <h4 className="font-medium text-sm text-info mb-1">Progress Outlook</h4>
                <p className={cn("text-sm", STATUS_COLORS.info.text)}>{aiInsights.progressPrediction}</p>
              </div>

              {/* Strategic Recommendations */}
              {aiInsights.strategicRecommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-info mb-2">AI Recommendations</h4>
                  <ul className="space-y-1">
                    {aiInsights.strategicRecommendations.map((recommendation, index) => (
                      <li key={index} className={cn("flex items-start gap-2 text-sm", STATUS_COLORS.info.text)}>
                        <Sparkles className={cn(ICONS.sizes.xs, "text-accent mt-0.5 flex-shrink-0")} />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium text-sm mb-2">Next Steps</h4>
          <ul className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className={cn(ICONS.semantic.inline, "text-muted-foreground mt-0.5 flex-shrink-0")} />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 