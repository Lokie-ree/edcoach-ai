import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Modal({
  isOpen,
  onOpenChange,
  modalSize = "lg",
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  modalSize?: "sm" | "lg" | "xl";
  children: React.ReactNode;
}) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Trap focus in modal
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onOpenChange]);

  const handleBackdropClick = () => {
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur pt-8 pb-8"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <motion.div
            initial={{ scale: 0, rotate: "180deg" }}
            animate={{
              scale: 1,
              rotate: "0deg",
              transition: {
                type: "spring",
                bounce: 0.25,
              },
            }}
            exit={{ scale: 0, rotate: "180deg" }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full cursor-default overflow-y-auto max-h-[calc(100vh-4rem)] rounded-xl bg-gradient-to-br from-background to-primary/10 p-6 text-foreground shadow-2xl border border-border",
              {
                "max-w-sm": modalSize === "sm",
                "max-w-lg": modalSize === "lg",
                "max-w-2xl": modalSize === "xl",
              },
            )}
            tabIndex={-1}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
