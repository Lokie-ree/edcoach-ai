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

import { cn } from "@/lib/utils";
import Modal from "@/components/mage-ui/modal";
import TeachersForm from "@/components/teachers-form";
import { Id } from "@/convex/_generated/dataModel";

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

export default function TeachersPage() {
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const teachers = useQuery(api.teachers.list);
  const createTeacher = useMutation(api.teachers.create);
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
    <div className="relative">
      {/* Background using theme colors */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/5" />
      </div>

      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Teachers
            </h1>
            <p className="text-foreground">
              Manage your teaching staff and their observations
            </p>
          </div>
          <Button onClick={() => setIsAddingTeacher(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Teachers
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {teachers?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Active Teachers
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {teachers?.filter((t) => t.status === "active").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Pending Invites
              </CardTitle>
              <UserPlus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {teachers?.filter((t) => t.status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

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
            createTeacher={createTeacher}
            updateTeacher={updateTeacher}
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

        {/* Teachers List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            All Teachers
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
            {teachers?.map((teacher) => (
              <Card key={teacher._id} className="flex flex-col">
                <CardContent className="p-4 flex-1">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-foreground">
                          {teacher.name}
                        </h3>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label="Edit teacher"
                            onClick={() => setEditingTeacher(teacher)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            aria-label="Delete teacher"
                            onClick={() => setDeletingTeacher(teacher)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">
                        {teacher.email}
                      </p>
                      {/* Show subject(s) */}
                      {(teacher.subject && teacher.subject.length > 0) ? (
                        <p className="text-sm text-foreground mt-1">
                          Subject(s): {Array.isArray(teacher.subject) ? teacher.subject.map((s) => SUBJECT_OPTIONS.find(o => o.value === s)?.label || s).join(", ") : teacher.subject}
                        </p>
                      ) : null}
                      {/* Show grade level(s) with fallback to gradeLevel for legacy data */}
                      {(teacher.gradeLevels && teacher.gradeLevels.length > 0) ? (
                        <p className="text-sm text-foreground">
                          Grade Level(s): {Array.isArray(teacher.gradeLevels) ? teacher.gradeLevels.map((g) => GRADE_LEVEL_OPTIONS.find(o => o.value === g)?.label || g).join(", ") : teacher.gradeLevels}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <span
                        // Use theme colors for status badges
                        className={cn(
                          "text-sm px-2 py-1 rounded-full",
                          {
                            // Increase background opacity in light mode
                            "bg-success/20 text-success dark:bg-success/20 dark:text-success": teacher.status === "active",
                            // Increase background opacity in light mode
                            "bg-info/20 text-info dark:bg-info/20 dark:text-info": teacher.status === "pending",
                            // Increase background opacity in light mode
                            "bg-destructive/20 text-destructive dark:bg-destructive/20 dark:text-destructive": teacher.status !== "active" && teacher.status !== "pending",
                          }
                        )}
                      >
                        {(teacher.status || "inactive")
                          .charAt(0)
                          .toUpperCase() +
                          (teacher.status || "inactive").slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
