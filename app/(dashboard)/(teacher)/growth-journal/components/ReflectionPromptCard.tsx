"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Edit3, Eye } from "lucide-react";
import { ReflectionModal } from "./ReflectionModal";
import { Id } from "@/convex/_generated/dataModel";

interface ReflectionPromptCardProps {
  question: string;
  lastAnswered: number | null;
  isOverdue: boolean;
  walkthroughId?: Id<"walkthroughs">;
  existingReflectionContent?: string;
  existingReflectionId?: Id<"reflections">;
}

export function ReflectionPromptCard({ 
  question, 
  lastAnswered, 
  isOverdue, 
  walkthroughId,
  existingReflectionContent,
  existingReflectionId 
}: ReflectionPromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reflection Prompt
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Current Question:</p>
          <p className="text-muted-foreground text-sm italic">&ldquo;{question}&rdquo;</p>
        </div>

        {lastAnswered && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last answered: {formatTimeAgo(lastAnswered)}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => setIsModalOpen(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Write Reflection
          </Button>
          {lastAnswered && (
            <Button variant="outline" size="sm" onClick={() => console.log("View previous reflection - to be implemented")}>
              <Eye className="h-4 w-4 mr-2" />
              View Previous
            </Button>
          )}
        </div>
      </CardContent>

      <ReflectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        question={question}
        walkthroughId={walkthroughId}
        isOverdue={isOverdue}
        existingReflection={lastAnswered && existingReflectionContent ? {
          content: existingReflectionContent,
          createdAt: lastAnswered,
          reflectionId: existingReflectionId
        } : null}
      />
    </Card>
  );
} 