"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BarChart2, CreditCard } from "lucide-react";
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
            Access key coaching features and management tools
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {/* New Walkthrough */}
            <Link href="/walkthrough/new">
              <Button
                variant="outline"
                className="h-auto flex-col items-center p-3 space-y-2 w-full"
              >
                <Plus className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">New Walkthrough</span>
              </Button>
            </Link>
            {/* View Teachers */}
            <Link href="/teachers">
              <Button
                variant="outline"
                className="h-auto flex-col items-center p-3 space-y-2 w-full"
              >
                <Users className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">View Teachers</span>
              </Button>
            </Link>
            {/* Analytics */}
            <Link href="/analytics">
              <Button
                variant="outline"
                className="h-auto flex-col items-center p-3 space-y-2 w-full"
              >
                <BarChart2 className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>
            </Link>
            {/* Billing */}
            <Link href="/billing">
              <Button
                variant="outline"
                className="h-auto flex-col items-center p-3 space-y-2 w-full"
              >
                <CreditCard className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Billing</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 