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
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-8 text-center">
        <Crown className={cn(ICONS.sizes.xl, "text-primary mx-auto mb-4")} />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {feature} Available in Coach Pro
        </h3>
        <p className="text-muted-foreground mb-6">
          Upgrade to Coach Pro to unlock advanced analytics, trends, and
          detailed insights
        </p>
        <Link href="/settings/billing">
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
            Upgrade to Coach Pro
            <ArrowRight className={cn(ICONS.semantic.inline, "ml-2")} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  </motion.div>
);
