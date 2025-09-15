import { motion } from "framer-motion";
import { ANIMATIONS, SPACING } from "@/lib/design-tokens";

export default function GridDistortion() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid grid-cols-12 gap-1 opacity-5">
        {Array.from({ length: 144 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-primary/10 rounded-sm"
            whileHover={{
              scale: 1.2,
              backgroundColor: "rgba(var(--primary), 0.15)",
            }}
            transition={{ duration: ANIMATIONS.duration.fast }}
          />
        ))}
      </div>
    </div>
  );
} 