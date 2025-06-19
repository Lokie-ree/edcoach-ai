"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";


export default function QuickActionsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your organization and schedule walkthroughs
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Walkthrough */}
            <Link href="/walkthrough/new">
              <Button
                variant="outline"
                className="h-auto flex-col items-center p-6 space-y-3 w-full"
              >
                <Plus className="h-8 w-8 text-primary" />
                <span className="text-base font-medium">New Walkthrough</span>
                <span className="text-sm text-muted-foreground text-center">
                  Schedule a classroom observation
                </span>
              </Button>
            </Link>

            {/* Manage Organization */}
            <Link href="/org">
              <Button
                variant="outline"
                className="h-auto flex-col items-center p-6 space-y-3 w-full"
              >
                <Settings className="h-8 w-8 text-primary" />
                <span className="text-base font-medium">Manage Organization</span>
                <span className="text-sm text-muted-foreground text-center">
                  Members, invites, and settings
                </span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 