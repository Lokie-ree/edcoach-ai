import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lightbulb, Sparkles, TrendingUp } from "lucide-react";

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
    if (progress >= 75) return "text-green-600";
    if (progress >= 50) return "text-yellow-600";
    if (progress >= 25) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Current Focus Area
          {aiInsights && (
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="space-y-3">
              {/* Trend Analysis */}
              <div>
                <h4 className="font-medium text-sm text-blue-900 mb-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trend Analysis
                </h4>
                <p className="text-sm text-blue-800">{aiInsights.trendAnalysis}</p>
              </div>

              {/* Progress Prediction */}
              <div>
                <h4 className="font-medium text-sm text-blue-900 mb-1">Progress Outlook</h4>
                <p className="text-sm text-blue-800">{aiInsights.progressPrediction}</p>
              </div>

              {/* Strategic Recommendations */}
              {aiInsights.strategicRecommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-blue-900 mb-2">AI Recommendations</h4>
                  <ul className="space-y-1">
                    {aiInsights.strategicRecommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                        <Sparkles className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
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
                <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 