"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ANIMATIONS, FORM_PATTERNS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  cancelVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  disabled?: boolean;
}

export function FormActions({
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitText = "Submit",
  cancelText = "Cancel",
  submitVariant = "default",
  cancelVariant = "outline",
  className,
  disabled = false
}: FormActionsProps) {
  return (
    <div className={cn(
      "flex gap-3 pt-4 border-t",
      FORM_PATTERNS.buttons.responsive,
      className
    )}>
      {onCancel && (
        <Button
          type="button"
          variant={cancelVariant}
          className={cn(
            "flex-1 h-12 transition-all",
            ANIMATIONS.classes.normal
          )}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelText}
        </Button>
      )}
      {onSubmit && (
        <Button
          type="submit"
          variant={submitVariant}
          className={cn(
            "flex-1 h-12 transition-all",
            ANIMATIONS.classes.normal,
            !disabled ? "hover:bg-primary/90" : ""
          )}
          onClick={onSubmit}
          disabled={isSubmitting || disabled}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting...
            </>
          ) : (
            submitText
          )}
        </Button>
      )}
    </div>
  );
}
