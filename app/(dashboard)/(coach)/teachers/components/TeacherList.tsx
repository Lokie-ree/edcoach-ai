import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Teacher } from "@/types/teacher";
import { TeacherStatusBadge } from "@/components/ui/teacher-status-badge";
import Link from "next/link";

interface TeacherListProps {
  teachers: Teacher[];
  setEditingTeacher: (teacher: Teacher) => void;
  onResendInvite?: (teacher: Teacher) => void;
}

const GRADE_BAND_OPTIONS = [
  { value: "elementary", label: "Elementary" },
  { value: "middle", label: "Middle School" },
  { value: "high", label: "High School" },
];

const SUBJECTS = [
  { value: "math", label: "Math" },
  { value: "ela", label: "ELA" },
  { value: "science", label: "Science" },
  { value: "social_studies", label: "Social Studies" },
  { value: "elective", label: "Elective" },
  { value: "sped", label: "SPED" },
];

export default function TeacherList({
  teachers,
  setEditingTeacher,
  onResendInvite,
}: TeacherListProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div>
          <CardTitle className="text-foreground">All Teachers</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your teaching staff details and status
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {teachers && teachers.length > 0 ? (
          <div className="space-y-4">
            {teachers.map((teacher) => (
              <Link key={teacher._id} href={`/teachers/${teacher._id}`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="font-medium text-foreground">
                        {teacher.name}
                      </h3>
                      <TeacherStatusBadge
                        teacher={teacher}
                        size="sm"
                        compact={true}
                        showActions={true}
                        onResendInvite={onResendInvite ? () => onResendInvite(teacher) : undefined}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {teacher.email}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {teacher.subject &&
                        teacher.subject.length > 0 &&
                        (Array.isArray(teacher.subject)
                          ? teacher.subject
                          : [teacher.subject]
                        ).map((subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            {SUBJECTS.find((o) => o.value === subject)?.label ||
                              subject}
                          </span>
                        ))}
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/60 text-accent-foreground border border-accent">
                        {GRADE_BAND_OPTIONS.find(
                          (o) => o.value === teacher.gradeBand,
                        )?.label || teacher.gradeBand}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 ml-0 sm:ml-4 mt-2 sm:mt-0">
                    {/* Always show edit button for active teachers */}
                    {teacher.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-[44px] touch-manipulation w-full sm:w-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingTeacher(teacher);
                        }}
                        aria-label={`Edit details for ${teacher.name}`}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    )}
                    
                    {/* Show resend for expired/pending invitations */}
                    {(teacher.status === "pending" || teacher.status === "needs_details") && onResendInvite && (
                      <Button
                        size="sm"
                        variant="default"
                        className="min-h-[44px] touch-manipulation w-full sm:w-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onResendInvite(teacher);
                        }}
                        aria-label={`Resend invitation to ${teacher.name}`}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Resend Invite
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No teachers yet</p>
            <p className="text-sm">
              Use the invite button above to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
