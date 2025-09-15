"use client";

import React from "react";
import { Form } from "@/components/ui/form";
import { ANIMATIONS, SPACING, FORM_PATTERNS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface FormWrapperProps {
  form: any;
  onSubmit: (values: any) => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "card" | "minimal";
}

export function FormWrapper({
  form,
  onSubmit,
  children,
  className,
  variant = "default"
}: FormWrapperProps) {
  const variants = {
    default: "space-y-6",
    card: "space-y-4",
    minimal: "space-y-4"
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "transition-all",
          ANIMATIONS.classes.normal,
          variants[variant],
          className
        )}
      >
        {children}
      </form>
    </Form>
  );
}
