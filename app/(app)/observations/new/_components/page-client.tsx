"use client";

import { Wizard } from "./wizard";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useAuthQuery } from "@/hooks/use-auth-query";

export function NewObservationPageClient() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading, isAuthenticated, data: user, error } = useAuthQuery(api.users.getCurrentUser);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Authentication Required</h2>
        <p className="text-muted-foreground">Please sign in to create observations.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Error</h2>
        <p className="text-muted-foreground">An error occurred while loading your data.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Setup Required</h2>
        <p className="text-muted-foreground">Please complete your profile setup to create observations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          New Observation
        </h1>
        <p className="text-muted-foreground">
          Create a new observation or walkthrough using our step-by-step wizard.
        </p>
      </motion.div>

      {/* Wizard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Wizard />
      </motion.div>
    </div>
  );
} 