import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  gradient?: boolean;
  rightContent?: ReactNode;
  className?: string;
  delay?: number;
}

export function PageHeader({
  title,
  description,
  gradient = false,
  rightContent,
  className,
  delay = 0
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        // Responsive flex: column on mobile, row on md+
        "flex flex-col md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {gradient ? (
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              {title}
            </span>
          ) : (
            <span className="text-foreground">{title}</span>
          )}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </div>
      {rightContent && (
        <div
          className={
            // Add spacing above on mobile, none on md+
            "mt-4 md:mt-0 flex-shrink-0"
          }
        >
          {rightContent}
        </div>
      )}
    </motion.div>
  );
} 