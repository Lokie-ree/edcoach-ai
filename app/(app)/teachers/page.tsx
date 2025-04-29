"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Plus, UserPlus, Users, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  department: z.string().optional(),
  gradeLevel: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TeachersPage() {
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const teachers = useQuery(api.teachers.list);
  const createTeacher = useMutation(api.teachers.create);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      gradeLevel: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createTeacher({
        name: values.name,
        email: values.email,
        department: values.department,
        gradeLevel: values.gradeLevel,
        status: "pending",
      });

      toast.success("Teacher added successfully");
      form.reset();
      setIsAddingTeacher(false);
    } catch (error) {
      console.error("Failed to add teacher:", error);
      toast.error("Failed to add teacher. Please try again.");
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

        {/* Add Teacher Form */}
        {isAddingTeacher && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Add New Teacher</CardTitle>
                <CardDescription className="text-foreground">
                  Enter the teacher&apos;s details to send them an invitation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter teacher's name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter teacher's email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter department" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gradeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter grade level" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          setIsAddingTeacher(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting
                          ? "Adding..."
                          : "Add Teacher"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                      <h3 className="font-medium text-foreground">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-foreground">
                        {teacher.email}
                      </p>
                      {teacher.department && (
                        <p className="text-sm text-foreground mt-1">
                          Department: {teacher.department}
                        </p>
                      )}
                      {teacher.gradeLevel && (
                        <p className="text-sm text-foreground">
                          Grade Level: {teacher.gradeLevel}
                        </p>
                      )}
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
