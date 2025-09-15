"use client";

import React from "react";
import { Form } from "@/components/ui/form";
import { ANIMATIONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { UseFormReturn, FieldValues } from "react-hook-form";

interface FormWrapperProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "card" | "minimal";
}

export function FormWrapper<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  className,
  variant = "default"
}: FormWrapperProps<TFieldValues>) {
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
