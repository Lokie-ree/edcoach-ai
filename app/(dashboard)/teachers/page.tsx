"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Modal from "@/components/mage-ui/modal";
import TeacherDetailsForm from "@/app/(dashboard)/teachers/components/TeacherDetailsForm";
import { motion } from "framer-motion";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/common/PageHeader";
import TeacherStatsCard from "./components/TeacherStatsCard";
import TeacherList from "./components/TeacherList";
import GridDistortion from "./components/GridDistortion";
import { Teacher } from "@/types/teacher";

export default function TeachersPage() {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Fetch teacher overview (stats + list) for the current coach
  const overview = useQuery(api.teachers.getTeacherOverview);
  const createTeacherFromUser = useMutation(api.teachers.createFromUser);
  const updateTeacher = useMutation(api.teachers.update);

  return (
    <div className="py-4 md:py-6 space-y-4">
      <div className="space-y-6 relative">
        <GridDistortion />
        <PageHeader
          title="Teachers"
          description={
            <>
              Manage your <AnimatedGradientText className="font-semibold">teaching staff</AnimatedGradientText> and their professional growth
            </>
          }
          gradient={true}
        />
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TeacherStatsCard
            total={overview?.total || 0}
            active={overview?.active || 0}
            needsDetails={overview?.needsDetails || 0}
            pending={overview?.pending || 0}
          />
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
        {/* Teachers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TeacherList
            teachers={(overview?.teachers || []).map(t => ({
              ...t,
              coachId: t.coachId ?? ""
            } as Teacher))}
            setEditingTeacher={(teacher) => setEditingTeacher(teacher)}
          />
        </motion.div>
      </div>
    </div>
  );
}
