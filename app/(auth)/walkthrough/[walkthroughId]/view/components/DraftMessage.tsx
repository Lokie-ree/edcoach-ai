import { Card, CardContent } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Walkthrough } from "@/types/walkthrough";

export default function DraftMessage({ walkthrough, walkthroughId, userRole }: { walkthrough: Walkthrough; walkthroughId: string; userRole: string }) {
  if (walkthrough.status !== "draft") return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-yellow-200 dark:border-yellow-800 relative overflow-hidden">
        <BorderBeam
          duration={6}
          size={200}
          colorFrom="#F59E0B"
          colorTo="#D97706"
        />
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Draft Walkthrough</h3>
          <p className="text-muted-foreground">
            This walkthrough is still in draft mode. Feedback will be available once it&apos;s completed.
          </p>
          {userRole === "coach" && (
            <Link href={`/walkthrough/${walkthroughId}`} className="mt-4 inline-block">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                Complete Walkthrough
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 