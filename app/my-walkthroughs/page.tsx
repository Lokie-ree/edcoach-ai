"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Eye,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { getIndicatorName } from "@/lib/indicator-utils";

export default function MyWalkthroughsPage() {
  const { user } = useUser();
  const { isLoading, isAuthenticated, user: convexUser } = useAuthRedirect();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get teacher record for current user
  const teacherRecord = useQuery(
    api.teachers.getByUserClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Get walkthroughs for this teacher
  const walkthroughs = useQuery(
    api.walkthroughs.listByTeacher,
    teacherRecord ? { teacherId: teacherRecord._id } : "skip"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !convexUser) {
    return null;
  }

  if (convexUser.role !== "teacher") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>This page is only available for teachers.</p>
      </div>
    );
  }

  const safeWalkthroughs = walkthroughs ?? [];
  
  // Filter walkthroughs
  const filteredWalkthroughs = safeWalkthroughs.filter(walkthrough => {
    const matchesSearch = !searchTerm || 
      walkthrough.evidenceSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walkthrough.reinforcementIndicator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walkthrough.refinementIndicator.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || walkthrough.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by date (newest first)
  const sortedWalkthroughs = filteredWalkthroughs.sort((a, b) => b.walkthroughDate - a.walkthroughDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Walkthroughs
        </h1>
        <p className="text-muted-foreground mt-2">
          View and track all your classroom observation walkthroughs
        </p>
      </motion.div>



      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search walkthroughs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Walkthroughs List */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {sortedWalkthroughs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No walkthroughs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Your coach will schedule walkthroughs soon."}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedWalkthroughs.map((walkthrough, index) => (
            <motion.div
              key={walkthrough._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={walkthrough.status === "completed" ? "default" : "secondary"}>
                          {walkthrough.status === "completed" ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Draft
                            </>
                          )}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(walkthrough.walkthroughDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-lg">
                        Classroom Walkthrough
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {walkthrough.evidenceSummary || "No evidence summary provided."}
                      </p>
                      
                      {walkthrough.status === "completed" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                              Reinforcement
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {getIndicatorName(walkthrough.reinforcementIndicator)}
                            </p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Refinement
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {getIndicatorName(walkthrough.refinementIndicator)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/walkthrough/${walkthrough._id}/view`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
} 