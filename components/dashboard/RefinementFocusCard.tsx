import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lightbulb } from "lucide-react";

interface RefinementFocusCardProps {
  currentIndicator: string;
  description: string;
  progress: number;
  nextSteps: string[];
}

export function RefinementFocusCard({ 
  currentIndicator, 
  description, 
  progress, 
  nextSteps 
}: RefinementFocusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Current Focus Area
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
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

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