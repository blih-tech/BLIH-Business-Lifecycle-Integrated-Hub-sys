import type {
  EvaluationFormItem,
  EvaluationSummaryStat,
} from "@/features/hr/performance/evaluation-form/types";

export const evaluationSummaryStats: EvaluationSummaryStat[] = [
  { id: "total-forms", label: "Total Forms", value: "4", icon: "file" },
  { id: "active-forms", label: "Active Forms", value: "3", icon: "circle-check" },
  { id: "total-questions", label: "Total Questions", value: "70", icon: "file" },
  { id: "total-usage", label: "Total Usage", value: "245", icon: "file" },
];

export const evaluationForms: EvaluationFormItem[] = [
  {
    id: "quarterly-performance-review",
    title: "Quarterly Performance Review",
    status: "active",
    tags: ["Performance", "General"],
    questions: 15,
    sections: 4,
    usedByEmployees: 45,
    modifiedOn: "2024-02-15",
  },
  {
    id: "annual-kpi-assessment",
    title: "Annual KPI Assessment",
    status: "active",
    tags: ["KPI", "Annual"],
    questions: 20,
    sections: 5,
    usedByEmployees: 120,
    modifiedOn: "2024-02-10",
  },
  {
    id: "okr-progress-checkin",
    title: "OKR Progress Check-in",
    status: "active",
    tags: ["OKR", "Quarterly"],
    questions: 10,
    sections: 3,
    usedByEmployees: 80,
    modifiedOn: "2024-02-08",
  },
  {
    id: "leadership-competency-review",
    title: "Leadership Competency Review",
    status: "draft",
    tags: ["Performance", "Leadership"],
    questions: 25,
    sections: 6,
    usedByEmployees: 0,
    modifiedOn: "2024-01-20",
  },
];
