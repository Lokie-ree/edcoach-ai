import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface ReflectionCardProps {
  walkthroughId: Id<"walkthroughs">;
  teacherId: Id<"teachers">;
  userRole: "teacher" | "coach";
}

export function ReflectionCard({ walkthroughId, teacherId, userRole }: ReflectionCardProps) {
  // Fetch the reflection for this walkthrough
  const reflection = useQuery(api.reflections.getReflectionByWalkthrough, { walkthroughId });
  const createReflection = useMutation(api.reflections.createReflection);
  const updateReflection = useMutation(api.reflections.updateReflection);

  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set initial content if editing existing reflection
  React.useEffect(() => {
    if (reflection && reflection.content) {
      setContent(reflection.content);
    }
  }, [reflection]);

  if (reflection === undefined) {
    return <div>Loading reflection...</div>;
  }
  if (reflection === null && userRole === "coach") {
    return <div>No reflection submitted yet.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (reflection) {
        await updateReflection({ reflectionId: reflection._id, content });
      } else {
        await createReflection({ walkthroughId, teacherId, content });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save reflection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Teacher view: form to submit/edit reflection
  if (userRole === "teacher") {
    return (
      <div className="rounded-lg border p-4 bg-card">
        <h3 className="font-semibold mb-2">Your Reflection</h3>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your reflection..."
            rows={5}
            className="mb-2"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !content.trim()}>
            {reflection ? "Update Reflection" : "Submit Reflection"}
          </Button>
        </form>
      </div>
    );
  }

  // Coach view: read-only reflection
  return (
    <div className="rounded-lg border p-4 bg-card">
      <h3 className="font-semibold mb-2">Teacher Reflection</h3>
      <div className="whitespace-pre-line">
        {reflection ? reflection.content : "No reflection submitted yet."}
      </div>
    </div>
  );
} 