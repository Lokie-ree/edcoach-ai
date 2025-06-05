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
  modalSize?: "sm" | "lg";
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-y-scroll bg-background/80 p-8 backdrop-blur"
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
              "relative w-full max-w-lg cursor-default overflow-hidden rounded-xl bg-gradient-to-br from-background to-primary/10 p-6 text-foreground shadow-2xl border border-border",
              {
                "max-w-sm": modalSize === "sm",
              },
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
