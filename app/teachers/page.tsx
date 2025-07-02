"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GraduationCap, Pencil } from "lucide-react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import Modal from "@/components/mage-ui/modal";
import TeacherDetailsForm from "@/components/forms/teacher-details-form";
import { motion } from "framer-motion";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

// Define grade bands for display - simplified
const GRADE_BAND_OPTIONS = [
  { value: "elementary", label: "Elementary" },
  { value: "middle", label: "Middle School" },
  { value: "high", label: "High School" },
];

// Define subjects - simplified list
const SUBJECTS = [
  { value: "math", label: "Math" },
  { value: "ela", label: "ELA" },
  { value: "science", label: "Science" },
  { value: "social_studies", label: "Social Studies" },
  { value: "elective", label: "Elective" },
  { value: "sped", label: "SPED" },
];

// Define a Teacher type for state
interface Teacher {
  _id: string;
  name: string;
  email: string;
  subject: string[];
  gradeBand: string;
  status?: string;
  isUserRecord?: boolean;
}

// Grid Distortion Background Component
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
              backgroundColor: "rgba(var(--primary), 0.15)",
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default function TeachersPage() {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSettingActive, setIsSettingActive] = useState(false);
  const { user, isLoaded } = useUser();
  const { setActive } = useClerk();
      const convexUser = useQuery(
      api.users.current,
      user && isLoaded ? {} : "skip"
    );

  // Try to set active organization if user has one but it's not active
  useEffect(() => {
    const trySetActiveOrg = async () => {
      if (
        convexUser?.clerkOrganizationId && 
        !isSettingActive &&
        setActive
      ) {
        console.log('User has organization ID but no active org, attempting to set active:', convexUser.clerkOrganizationId);
        setIsSettingActive(true);
        try {
          await setActive({ organization: convexUser.clerkOrganizationId });
          console.log('Successfully set active organization from Convex record');
        } catch (error) {
          console.warn('Failed to set active organization:', error);
        } finally {
          setIsSettingActive(false);
        }
      }
    };

    trySetActiveOrg();
  }, [convexUser, setActive, isSettingActive]);

  // Fetch teachers for the current user's organization
  const teachers = useQuery(api.teachers.list);
  const createTeacherFromUser = useMutation(api.teachers.createFromUser);
  const updateTeacher = useMutation(api.teachers.update);



  return (
    <div className="space-y-6 relative">
      <GridDistortion />

      {/* Header with Animation */}
      <PageHeader
        title="Teachers"
        description={
          <>
            Manage your <AnimatedGradientText className="font-semibold">teaching staff</AnimatedGradientText> and their professional growth
          </>
        }
        gradient={true}
      />

      {/* Stats Card with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <div>
              <CardTitle className="text-foreground">Teacher Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Summary of your teaching staff • 
                <Link href="/org" className="text-primary hover:underline ml-1">
                  Manage teachers in Organization Settings
                </Link>
                <br />
                <span className="text-xs text-muted-foreground/80 mt-1 block">
                  New members automatically get teacher role. To remove a teacher, use Organization Settings.
                </span>
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {teachers?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {teachers?.filter((t) => t.status === "active").length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Teachers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Pencil className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {teachers?.filter((t) => t.status === "needs_details" || t.status === "pending").length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Need Details</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>



      {/* Edit Teacher Details Modal */}
      <Modal
        isOpen={!!editingTeacher}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTeacher(null);
          }
        }}
        modalSize="lg"
      >
        {editingTeacher && (
          <TeacherDetailsForm
            onSuccess={() => {
              setEditingTeacher(null);
            }}
            createTeacherFromUser={async (values) => {
              await createTeacherFromUser(values);
            }}
            updateTeacher={async (values) => {
              await updateTeacher(values);
            }}
            teacher={editingTeacher}
          />
        )}
      </Modal>



      {/* Teachers List with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">All Teachers</CardTitle>
            <p className="text-sm text-muted-foreground">Manage your teaching staff details and status</p>
          </CardHeader>
          <CardContent>
            {teachers && teachers.length > 0 ? (
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <motion.div
                    key={teacher._id}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-foreground">
                            {teacher.name}
                          </h3>
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              {
                                "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-300 border border-green-200 dark:border-green-800": teacher.status === "active",
                                "bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800": teacher.status === "pending",
                                "bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800": teacher.status === "needs_details",
                                "bg-gray-100 text-gray-700 dark:bg-gray-950/20 dark:text-gray-300 border border-gray-200 dark:border-gray-800": teacher.status !== "active" && teacher.status !== "pending" && teacher.status !== "needs_details",
                              }
                            )}
                          >
                            {teacher.status === "needs_details" 
                              ? "Needs Details"
                              : (teacher.status || "inactive")
                                  .charAt(0)
                                  .toUpperCase() +
                                  (teacher.status || "inactive").slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {teacher.email}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(teacher.subject && teacher.subject.length > 0) && 
                            (Array.isArray(teacher.subject) ? teacher.subject : [teacher.subject]).map((subject) => (
                              <span
                                key={subject}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                              >
                                {SUBJECTS.find(o => o.value === subject)?.label || subject}
                              </span>
                            ))
                          }
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/60 text-accent-foreground border border-accent"
                          >
                            {GRADE_BAND_OPTIONS.find(o => o.value === teacher.gradeBand)?.label || teacher.gradeBand}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant={teacher.status === "needs_details" ? "default" : "outline"}
                          className={teacher.status === "needs_details" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                          onClick={() => setEditingTeacher(teacher)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          {teacher.status === "needs_details" ? "Add Details" : "Edit"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teachers in your organization yet</p>
                <p className="text-sm">Click &quot;Invite Teachers&quot; to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
