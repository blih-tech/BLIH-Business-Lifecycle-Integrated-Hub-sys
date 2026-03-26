export type EvaluationSortBy = "name-asc" | "name-desc";

export type EvaluationFormStatus = "active" | "draft";

export type EvaluationSummaryStat = {
  id: string;
  label: string;
  value: string;
  icon: "file" | "circle-check";
};

export type EvaluationFormItem = {
  id: string;
  title: string;
  status: EvaluationFormStatus;
  tags: string[];
  questions: number;
  sections: number;
  usedByEmployees: number;
  modifiedOn: string;
};
