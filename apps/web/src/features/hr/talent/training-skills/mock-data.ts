import type {
  PreviousTraining,
  SkillGapAssessment,
  TrainingRecommendation,
  TrainingRequest,
  TrainingSkillsStat,
} from "@/features/hr/talent/training-skills/types";

export const trainingSkillsStats: TrainingSkillsStat[] = [
  { id: "pending", label: "Pending Requests", value: "2", icon: "clock" },
  { id: "completed", label: "Completed Trainings", value: "3", icon: "check" },
  { id: "assessments", label: "Active Assessments", value: "1", icon: "trend" },
  { id: "certifications", label: "Certifications", value: "3", icon: "badge" },
];

export const trainingRequests: TrainingRequest[] = [
  {
    id: "request-1",
    initials: "JS",
    name: "John Smith",
    department: "Engineering",
    title: "Advanced Cloud Architecture",
    provider: "AWS",
    cost: "$2,500",
    duration: "5 days",
    startDate: "2024-03-15",
    justification: "Required for upcoming cloud migration project",
    status: "Pending",
  },
  {
    id: "request-2",
    initials: "SJ",
    name: "Sarah Johnson",
    department: "Marketing",
    title: "Digital Marketing Analytics",
    provider: "Google",
    cost: "$2,500",
    duration: "5 days",
    startDate: "2024-03-15",
    justification: "Required for upcoming cloud migration project",
    status: "Pending",
  },
];

export const previousTrainings: PreviousTraining[] = [
  {
    id: "prev-1",
    initials: "SL",
    name: "Dr. Samantha Lee",
    department: "Analytics",
    trainingTitle: "Advanced Data Science",
    certificationLabel: "Certification",
    certificationValue: "Certified Data Scientist",
    score: "95%",
    completed: "2024-02-01",
  },
  {
    id: "prev-2",
    initials: "ER",
    name: "Emily Rodriguez",
    department: "Analytics",
    trainingTitle: "Leadership Fundamentals",
    certificationLabel: "Certification",
    certificationValue: "Leadership Certificate",
    score: "92%",
    completed: "2024-01-28",
  },
  {
    id: "prev-3",
    initials: "MB",
    name: "Mike Brown",
    department: "UX",
    trainingTitle: "UX Design Principles",
    certificationLabel: "Certification",
    certificationValue: "UX Design Certificate",
    score: "88%",
    completed: "2024-01-15",
  },
];

export const skillGapAssessments: SkillGapAssessment[] = [
  {
    id: "gap-1",
    initials: "DL",
    name: "David Lee",
    department: "Design",
    status: "ongoing",
    skillArea: "Technical Skills",
    progress: 65,
    dueDate: "2024-02-28",
    identifiedGaps: ["Advanced Figma", "Design Systems", "Accessibility"],
  },
  {
    id: "gap-2",
    initials: "LM",
    name: "Lisa Martinez",
    department: "Marketing",
    status: "completed",
    skillArea: "Leadership Skills",
    identifiedGaps: ["Team Management", "Strategic Planning"],
    recommendedActions: ["Leadership training program", "Mentorship with senior manager"],
  },
];

export const urgentSkillGaps: TrainingRecommendation[] = [
  {
    id: "urgent-1",
    title: "Cloud Security",
    department: "Engineering",
    priority: "high",
    affectsCount: 12,
    recommendation: "Implement company-wide cloud security certification program",
  },
  {
    id: "urgent-2",
    title: "AI Marketing Tools",
    department: "Marketing",
    priority: "medium",
    affectsCount: 8,
    recommendation: "Provide training on AI-powered marketing automation platforms",
  },
];

export const emergingNeeds: TrainingRecommendation[] = [
  {
    id: "emerging-1",
    title: "AI Design Tools",
    department: "Design",
    priority: "medium",
    affectsCount: 6,
    recommendation: "Early adoption training for AI-assisted design tools",
  },
];

export const certificationOpportunities: TrainingRecommendation[] = [
  {
    id: "cert-1",
    title: "Advanced Analytics Certification",
    department: "Analytics",
    priority: "low",
    affectsCount: 5,
    recommendation: "Support team members pursuing professional certifications",
  },
];
