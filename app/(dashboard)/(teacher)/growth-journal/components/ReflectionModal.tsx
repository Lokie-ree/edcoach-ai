"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, X, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { ANIMATIONS, SPACING, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  walkthroughId?: Id<"walkthroughs">;
  existingReflection?: {
    content: string;
    createdAt: number;
    reflectionId?: Id<"reflections">;
  } | null;
  isOverdue?: boolean;
}

export function ReflectionModal({ 
  isOpen, 
  onClose, 
  question, 
  walkthroughId,
  existingReflection,
  isOverdue = false 
}: ReflectionModalProps) {
  const [content, setContent] = useState(existingReflection?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Real Convex mutations
  const createReflection = useMutation(api.reflections.createReflection);
  const updateReflection = useMutation(api.reflections.updateReflection);
  
  // Get current teacher record
  const teacherRecord = useQuery(api.teachers.getMyRecord);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please write your reflection before submitting");
      return;
    }

    if (!teacherRecord) {
      toast.error("Teacher record not found. Please contact support.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (existingReflection?.reflectionId) {
        // Update existing reflection
        await updateReflection({
          reflectionId: existingReflection.reflectionId,
          content: content.trim()
        });
        toast.success("Reflection updated successfully!");
      } else if (walkthroughId) {
        // Create new reflection
        await createReflection({
          walkthroughId,
          teacherId: teacherRecord._id,
          content: content.trim()
        });
        toast.success("Reflection saved successfully!");
      } else {
        toast.error("Cannot save reflection without walkthrough context");
        return;
      }
      
      onClose();
      setContent("");
    } catch (error) {
      console.error("Failed to save reflection:", error);
      toast.error("Failed to save reflection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (content.trim() && content !== (existingReflection?.content || "")) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        setContent(existingReflection?.content || "");
        onClose();
      }
    } else {
      onClose();
    }
  };

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-hidden flex flex-col", SPACING.component.lg)}>
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {existingReflection ? "Edit Reflection" : "Write Reflection"}
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left">
            Take time to reflect on your recent feedback and professional growth
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Reflection Prompt */}
          <Card className={cn(STATUS_COLORS.info.bg, "border-l-4", STATUS_COLORS.info.border)}>
            <CardContent className={cn("pt-4", SPACING.component.sm)}>
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-full", STATUS_COLORS.info.bg)}>
                  <Sparkles className={cn("h-4 w-4", STATUS_COLORS.info.text)} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-2">Reflection Prompt</h4>
                  <p className="text-sm text-muted-foreground italic">
                    &ldquo;{question}&rdquo;
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Reflection Info */}
          {existingReflection && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatTimeAgo(existingReflection.createdAt)}</span>
            </div>
          )}

          {/* Reflection Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reflection-content" className="text-sm font-medium">
                Your Reflection
              </Label>
              <Textarea
                id="reflection-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts on the feedback you received. How will you apply these insights to improve your teaching practice?"
                className={cn(
                  "min-h-[200px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  ANIMATIONS.classes.normal
                )}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {content.length > 0 && `${content.length} characters`}
                </span>
                <span>
                  {content.length < 50 && "Consider writing at least a few sentences for a meaningful reflection"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className={cn("flex-1", ANIMATIONS.classes.normal)}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {existingReflection ? "Update Reflection" : "Save Reflection"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
