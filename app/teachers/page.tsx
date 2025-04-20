"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeachersPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const createTeacher = useMutation(api.teachers.create);
  const teachers = useQuery(api.teachers.list);
  const currentUser = useQuery(api.users.getCurrentUser);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      department: formData.get("department") as string,
      gradeLevel: formData.get("gradeLevel") as string,
    };

    try {
      await createTeacher(data);
      toast.success("Teacher added successfully");
      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      toast.error("There was an error adding the teacher. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add a Teacher</CardTitle>
            <CardDescription>
              Add a new teacher to your organization's roster.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter teacher's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter teacher's email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    placeholder="Enter department"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Input
                    id="gradeLevel"
                    name="gradeLevel"
                    placeholder="Enter grade level"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Teacher"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher Roster</CardTitle>
            <CardDescription>
              View and manage your organization's teachers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Grade Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers?.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.email || "-"}</TableCell>
                    <TableCell>{teacher.department || "-"}</TableCell>
                    <TableCell>{teacher.gradeLevel || "-"}</TableCell>
                  </TableRow>
                ))}
                {teachers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No teachers added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 