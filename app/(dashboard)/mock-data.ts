// Mock data for dashboard development
// This will be replaced with live data in Stage 3

export const mockData = {
  coachDashboardData: {
    kpis: {
      totalTeachers: 12,
      activeTeachers: 9,
      totalWalkthroughs: 47,
      totalFeedback: 42,
    },
    priorities: {
      walkthroughsDue: 3,
      reflectionsToReview: 7,
      teachersNeedingSupport: 2,
    },
    recentActivity: [
      {
        id: "1",
        type: "walkthrough" as const,
        teacherName: "Sarah Johnson",
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        status: "completed",
        title: "Math Observation - Fractions Unit",
      },
      {
        id: "2",
        type: "reflection" as const,
        teacherName: "Mike Chen",
        timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        status: "pending",
        title: "Reflection on Student Engagement",
      },
      {
        id: "3",
        type: "feedback" as const,
        teacherName: "Emily Rodriguez",
        timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
        status: "generated",
        title: "AI Feedback - Classroom Management",
      },
      {
        id: "4",
        type: "walkthrough" as const,
        teacherName: "David Thompson",
        timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
        status: "scheduled",
        title: "Science Lab Observation",
      },
      {
        id: "5",
        type: "reflection" as const,
        teacherName: "Lisa Wang",
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        status: "completed",
        title: "Reflection on Assessment Strategies",
      },
    ],
  },

  teacherDashboardData: {
    pgpGoal: {
      title: "Improve Student Engagement in Math",
      description: "Focus on increasing student participation and active learning during mathematics instruction through differentiated strategies and technology integration.",
      progress: 65,
      trend: "Engaged" as const,
      targetDate: "2024-06-15",
    },
    recentWalkthroughs: [
      {
        id: "1",
        date: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        indicators: ["ST1.1", "ST2.3"],
        hasReflection: true,
        title: "Fractions Unit Observation",
        status: "completed",
      },
      {
        id: "2",
        date: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
        indicators: ["ST1.2", "ST3.1"],
        hasReflection: false,
        title: "Geometry Lesson",
        status: "completed",
      },
      {
        id: "3",
        date: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2 weeks ago
        indicators: ["ST2.1", "ST2.2"],
        hasReflection: true,
        title: "Algebra Introduction",
        status: "completed",
      },
      {
        id: "4",
        date: Date.now() - 21 * 24 * 60 * 60 * 1000, // 3 weeks ago
        indicators: ["ST1.3", "ST3.2"],
        hasReflection: true,
        title: "Problem Solving Strategies",
        status: "completed",
      },
      {
        id: "5",
        date: Date.now() - 28 * 24 * 60 * 60 * 1000, // 4 weeks ago
        indicators: ["ST1.1", "ST2.1"],
        hasReflection: false,
        title: "Number Sense Development",
        status: "completed",
      },
    ],
    reflectionPrompt: {
      question: "How did your recent walkthrough feedback influence your lesson planning this week?",
      lastAnswered: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      isOverdue: false,
    },
    refinementFocus: {
      currentIndicator: "ST2.3 - Student-Centered Learning",
      description: "Focus on creating more opportunities for students to take ownership of their learning through collaborative activities and choice-based assignments.",
      progress: 40,
      nextSteps: [
        "Implement student choice boards for homework assignments",
        "Create more group-based problem-solving activities",
        "Use exit tickets to gather student feedback on lesson effectiveness",
      ],
    },
    strengths: [
      {
        indicator: "ST1.1",
        name: "Clear Learning Objectives",
        frequency: 8,
        lastObserved: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        indicator: "ST2.1",
        name: "Student Engagement",
        frequency: 6,
        lastObserved: Date.now() - 14 * 24 * 60 * 60 * 1000,
      },
      {
        indicator: "ST3.1",
        name: "Assessment Strategies",
        frequency: 5,
        lastObserved: Date.now() - 21 * 24 * 60 * 60 * 1000,
      },
    ],
  },
}; 