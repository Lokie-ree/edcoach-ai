"use client";

import React from "react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, BarChart, BookOpen, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { useAuthQuery } from "@/hooks/use-auth-query";

// Tilted Card Component
const TiltedCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{ zIndex: 1 }}
    >
      {children}
    </motion.div>
  );
};

// Grid Distortion Background
const GridDistortion = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid grid-cols-12 gap-1 opacity-5">
        {Array.from({ length: 144 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-primary/10 rounded-sm"
            whileHover={{ 
              scale: 1.2,
              backgroundColor: "rgba(var(--primary), 0.15)"
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { isLoading: isLoadingTeachers, data: teachers = [] } = useAuthQuery<Doc<"teachers">[]>(api.teachers.list);
  const { isLoading: isLoadingObservations, data: observations = [] } = useAuthQuery<Doc<"observations">[]>(api.observations.list);
  
  // Show loading state
  if (isLoadingTeachers || isLoadingObservations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Ensure we have arrays to work with
  const safeTeachers = teachers ?? [];
  const safeObservations = observations ?? [];
  
  // Calculate observation stats
  const totalObservations = safeObservations.length;
  const completedObservations = safeObservations.filter((o) => o.status === "completed").length;
  const inProgressObservations = safeObservations.filter((o) => o.status === "in_progress").length;
  const completionRate = totalObservations > 0 ? (completedObservations / totalObservations) * 100 : 0;
  
  return (
    <div className="space-y-6 relative">
      <GridDistortion />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to EdCoach AI. Here's an overview of your organization.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Quick Actions */}
        <TiltedCard className="md:col-span-2">
          <Card className="h-full bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks you might want to perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/teachers">
                  <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 border-indigo-200/50 dark:border-indigo-800/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20">
                    <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2">
                      <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium">Manage Teachers</span>
                  </Button>
                </Link>
                <Link href="/observations/new">
                  <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 border-purple-200/50 dark:border-purple-800/20 hover:bg-purple-50/30 dark:hover:bg-purple-950/20">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                      <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">Start New Observation</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 border-indigo-200/50 dark:border-indigo-800/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20">
                    <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2">
                      <BarChart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium">View Analytics</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TiltedCard>

        {/* Recent Activity */}
        <TiltedCard>
          <Card className="h-full bg-gradient-to-br from-white to-purple-50/30 dark:from-zinc-900 dark:to-purple-950/10">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeObservations.slice(0, 3).map((observation: Doc<"observations">) => (
                  <motion.div 
                    key={observation._id} 
                    className="flex items-start"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 mr-3",
                      observation.status === "completed" ? "bg-green-500" :
                      observation.status === "in_progress" ? "bg-yellow-500" :
                      "bg-indigo-500"
                    )} />
                    <div>
                      <p className="text-sm font-medium">
                        {observation.status === "completed" ? "Observation completed" :
                         observation.status === "in_progress" ? "Observation in progress" :
                         "New observation started"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(observation._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {(!safeObservations || safeObservations.length === 0) && (
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium">Setup completed</p>
                      <p className="text-xs text-muted-foreground">Welcome to EdCoach AI!</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </TiltedCard>
      </motion.div>
      {/* Stats Grid */}
      <motion.div 
        className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TiltedCard>
          <Card className="h-full bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Teachers
              </CardTitle>
              <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight">{safeTeachers.length}</div>
              <p className="text-xs text-muted-foreground mt-2 md:mt-3">
                Teachers in your organization
              </p>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-zinc-900 dark:to-purple-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Observations
              </CardTitle>
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight">{totalObservations}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-2 md:mt-3">
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  {completedObservations} completed
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                  {inProgressObservations} in progress
                </span>
              </div>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
              <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight">{completionRate.toFixed(1)}%</div>
              <div className="mt-4 md:mt-6">
                <Progress value={completionRate} className="h-2 bg-indigo-100 dark:bg-indigo-900/30" />
              </div>
            </CardContent>
          </Card>
        </TiltedCard>

        <TiltedCard>
          <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-zinc-900 dark:to-purple-950/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                School Info
              </CardTitle>
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                <School className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight">1</div>
              <p className="text-xs text-muted-foreground mt-2 md:mt-3">
                Schools in your network
              </p>
            </CardContent>
          </Card>
        </TiltedCard>
      </motion.div>
    </div>
  );
};

export default Dashboard;
