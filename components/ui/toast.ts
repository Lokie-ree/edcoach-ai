import { toast as sonnerToast } from "sonner";

type ToastType = "default" | "destructive" | "success";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastType;
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastProps) => {
      sonnerToast(title, {
        description,
        className:
          variant === "destructive"
            ? "bg-destructive text-destructive-foreground"
            : variant === "success"
            ? "bg-success text-success-foreground"
            : undefined,
      });
    },
  };
}
