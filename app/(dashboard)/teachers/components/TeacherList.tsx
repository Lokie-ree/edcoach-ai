import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Teacher } from "@/types/teacher";


interface TeacherListProps {
  teachers: Teacher[];
  setEditingTeacher: (teacher: Teacher) => void;
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

export default function TeacherList({ teachers, setEditingTeacher }: TeacherListProps) {
  return (
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
            <p>No teachers yet</p>
            <p className="text-sm">Click &quot;Invite Teachers&quot; to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 