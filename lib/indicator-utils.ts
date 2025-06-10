// Mapping of indicator codes to full names based on Louisiana Educator Rubric
const INDICATOR_MAPPINGS: Record<string, string> = {
  // Instruction Domain
  "SO": "Standards and Objectives",
  "MS": "Motivating Students", 
  "PIC": "Presenting Instructional Content",
  "ACT": "Activities and Materials",
  "QU": "Questioning",
  "FEED": "Academic Feedback",
  "GRP": "Grouping Students",
  "TCK": "Teacher Content Knowledge",
  "TKS": "Teacher Knowledge of Students",
  "TH": "Thinking",
  "PS": "Problem-Solving",
  
  // Planning Domain
  "IP": "Instructional Plans",
  "SW": "Student Work",
  "AS": "Assessment",
  
  // Environment Domain
  "ES": "Expectations",
  "ESMB": "Engaging Students and Managing Behavior",
  "ENV": "Environment",
  "RC": "Respectful Conditions",
  
  // Professionalism Domain
  "GDP": "Growing and Developing Professionally",
  "RT": "Reflecting on Teaching",
  "SI": "School Involvement",
  "SR": "School Responsibilities"
};

/**
 * Get the full indicator name from an indicator code
 * @param code - The indicator code (e.g., "SO", "MS", "PIC")
 * @returns The full indicator name or the original code if not found
 */
export function getIndicatorName(code: string): string {
  return INDICATOR_MAPPINGS[code] || code;
}

/**
 * Get all indicator mappings
 * @returns Object with all indicator code to name mappings
 */
export function getAllIndicatorMappings(): Record<string, string> {
  return { ...INDICATOR_MAPPINGS };
}

/**
 * Check if an indicator code exists in the mappings
 * @param code - The indicator code to check
 * @returns True if the code exists in mappings
 */
export function isValidIndicatorCode(code: string): boolean {
  return code in INDICATOR_MAPPINGS;
} 