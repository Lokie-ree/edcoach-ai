import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Walkthrough } from "@/types/walkthrough";
import WalkthroughCard from "./WalkthroughCard";

interface WalkthroughListProps {
  walkthroughs: Walkthrough[];
  isCoach: boolean;
  getIndicatorName: (indicator: string) => string;
}

export default function WalkthroughList({
  walkthroughs,
  isCoach,
  getIndicatorName,
}: WalkthroughListProps) {
  if (walkthroughs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No walkthroughs found</h3>
          <p className="text-muted-foreground">
            No walkthroughs match your search or filter criteria.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {walkthroughs.map((walkthrough) => (
        <WalkthroughCard
          key={walkthrough._id}
          walkthrough={walkthrough}
          isCoach={isCoach}
          getIndicatorName={getIndicatorName}
        />
      ))}
    </div>
  );
}
