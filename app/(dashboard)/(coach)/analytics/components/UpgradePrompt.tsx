import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export const UpgradePrompt = ({ feature }: { feature: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      <CardContent className="p-8 text-center">
        <Crown className={cn(ICONS.sizes.xl, "text-purple-600 mx-auto mb-4")} />
        <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">
          {feature} Available in Coach Pro
        </h3>
        <p className="text-purple-700 dark:text-purple-300 mb-6">
          Upgrade to Coach Pro to unlock advanced analytics, trends, and
          detailed insights
        </p>
        <Link href="/settings/billing">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
            Upgrade to Coach Pro
            <ArrowRight className={cn(ICONS.semantic.inline, "ml-2")} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  </motion.div>
);
