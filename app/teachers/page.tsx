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
import { UserPlus, Users, GraduationCap, Pencil, Trash2 } from "lucide-react";
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
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import Modal from "@/components/mage-ui/modal";
import TeacherDetailsForm from "@/components/forms/teacher-details-form";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { OrganizationProfile } from "@clerk/nextjs";

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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Fetch teachers for the current user's organization
  const teachers = useQuery(api.teachers.list);
  const createTeacherFromUser = useMutation(api.teachers.createFromUser);
  const updateTeacher = useMutation(api.teachers.update);
  const removeTeacher = useMutation(api.teachers.remove);

  const handleDelete = async () => {
    if (!deletingTeacher) return;
    try {
      await removeTeacher({ id: deletingTeacher._id as Id<'teachers'> });
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-foreground">Teacher Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Summary of your teaching staff</p>
            </div>
            <Button onClick={() => setShowInviteModal(true)} className="shrink-0">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Teachers
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <UserPlus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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

      {/* Invite Teachers Modal */}
      <Modal
        isOpen={showInviteModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowInviteModal(false);
          }
        }}
        modalSize="lg"
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Invite Teachers
          </h2>
          <p className="text-foreground mb-4">
            Use Clerk&apos;s organization management to invite teachers to your organization. 
            Once they accept, you can add their teaching details.
          </p>
          <OrganizationProfile />
        </div>
      </Modal>

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
