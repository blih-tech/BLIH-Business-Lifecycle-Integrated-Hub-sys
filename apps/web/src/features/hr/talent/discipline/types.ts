export type DisciplinePriority = "high" | "medium";

export type DisciplineActionCase = {
  id: string;
  initials: string;
  name: string;
  department: string;
  issueDate: string;
  issueTitle: string;
  description: string;
  priority: DisciplinePriority;
  score: string;
};

export type DisciplineCase = {
  id: string;
  initials: string;
  name: string;
  issueType: string;
  score: string;
  scoreTone: "primary" | "danger" | "neutral";
};

export type DisciplineStat = {
  id: string;
  label: string;
  value: string;
  tone: "primary" | "danger";
};
