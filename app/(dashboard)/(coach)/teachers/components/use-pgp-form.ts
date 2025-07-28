import { useState, useEffect } from "react";

// Define the shape of your form data
interface PgpFormData {
  indicatorCode: string;
  contextNotes: string;
  goalText: string;
}

export function usePgpForm(initialData: PgpFormData) {
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Compare current form data to the initial data to see if anything has changed.
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(hasChanged);
  }, [formData, initialData]);

  // Return the state and a function to update it
  return { formData, setFormData, isDirty };
}
