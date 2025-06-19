"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Search,
  Award,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { getIndicatorName } from "@/lib/indicator-utils";
import { PageHeader } from "@/components/layout/PageHeader";

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
      <PageHeader
        title="My Walkthroughs"
        description="View and track all your classroom observation walkthroughs"
      />

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
              <Link href={`/walkthrough/${walkthrough._id}/view`} className="block">
                <Card className="hover:shadow-md hover:bg-accent/30 transition-all duration-200 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-2">
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
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                            <Award className="h-3 w-3" />
                            {getIndicatorName(walkthrough.reinforcementIndicator)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                            <Target className="h-3 w-3" />
                            {getIndicatorName(walkthrough.refinementIndicator)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
} 