"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, UserPlus, Users, GraduationCap, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/ui/page-header";

import { cn } from "@/lib/utils";
import Modal from "@/components/mage-ui/modal";
import TeachersForm from "@/components/forms/teachers-form";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

const SUBJECT_OPTIONS = [
  { value: "math", label: "Math" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "art", label: "Art" },
  { value: "music", label: "Music" },
  { value: "pe", label: "Physical Education" },
  { value: "other", label: "Other" },
];
const GRADE_LEVEL_OPTIONS = [
  { value: "k", label: "Kindergarten" },
  { value: "1", label: "1st Grade" },
  { value: "2", label: "2nd Grade" },
  { value: "3", label: "3rd Grade" },
  { value: "4", label: "4th Grade" },
  { value: "5", label: "5th Grade" },
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

// Define a Teacher type for state
interface Teacher {
  _id: string;
  name: string;
  email?: string;
  subject: string[];
  gradeLevels: string[];
  status?: string;
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
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const { user } = useUser();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );
  const coachId = convexUser?._id;

  // Only fetch teachers when coachId is available
  const teachers = useQuery(
    api.teachers.list,
    coachId ? { coachId } : "skip"
  );
  const createTeacher = useMutation(api.teachers.create);
  const updateTeacher = useMutation(api.teachers.update);
  const removeTeacher = useMutation(api.teachers.remove);

  const handleDelete = async () => {
    if (!deletingTeacher || !coachId) return;
    try {
      await removeTeacher({ id: deletingTeacher._id as Id<'teachers'>, coachId });
      toast.success("Teacher deleted successfully");
      setDeletingTeacher(null);
    } catch (error) {
      console.error("Failed to delete teacher:", error);
      toast.error("Failed to delete teacher. Please try again.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <GridDistortion />

      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header with Animation */}
        <PageHeader
          title="Teachers"
          description={
            <>
              Manage your <AnimatedGradientText className="font-semibold">teaching staff</AnimatedGradientText> and their professional growth
            </>
          }
        />

        {/* Stats Card with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-foreground">Teacher Overview</CardTitle>
                <p className="text-sm text-muted-foreground">Summary of your teaching staff</p>
              </div>
              <Button onClick={() => setIsAddingTeacher(true)} className="shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {teachers?.filter((t) => t.status === "pending").length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Pending Invites</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Teacher Modal */}
        <Modal
          isOpen={isAddingTeacher || !!editingTeacher}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingTeacher(false);
              setEditingTeacher(null);
            }
          }}
          modalSize="lg"
        >
          <TeachersForm
            onSuccess={() => {
              setIsAddingTeacher(false);
              setEditingTeacher(null);
            }}
            createTeacher={async (values) => {
              if (!coachId) return;
              await createTeacher({ ...values, coachId });
            }}
            updateTeacher={async (values) => {
              if (!coachId) return;
              await updateTeacher({ ...values, coachId });
            }}
            teacher={editingTeacher ?? undefined}
          />
        </Modal>

        <Dialog open={!!deletingTeacher} onOpenChange={(open) => { if (!open) setDeletingTeacher(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This will permanently delete {deletingTeacher?.name}. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                                  "bg-gray-100 text-gray-700 dark:bg-gray-950/20 dark:text-gray-300 border border-gray-200 dark:border-gray-800": teacher.status !== "active" && teacher.status !== "pending",
                                }
                              )}
                            >
                              {(teacher.status || "inactive")
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
                                  {SUBJECT_OPTIONS.find(o => o.value === subject)?.label || subject}
                                </span>
                              ))
                            }
                            {(teacher.gradeLevels && teacher.gradeLevels.length > 0) && 
                              (Array.isArray(teacher.gradeLevels) ? teacher.gradeLevels : [teacher.gradeLevels]).map((grade) => (
                                <span
                                  key={grade}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/60 text-accent-foreground border border-accent"
                                >
                                  {GRADE_LEVEL_OPTIONS.find(o => o.value === grade)?.label || grade}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            aria-label="Edit teacher"
                            onClick={() => setEditingTeacher(teacher)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            aria-label="Delete teacher"
                            onClick={() => setDeletingTeacher(teacher)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No teachers added yet</p>
                  <p className="text-sm">Click &quot;Add Teacher&quot; to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
