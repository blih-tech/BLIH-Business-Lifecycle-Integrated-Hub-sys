import type { EvaluationFormItem } from "@/features/hr/performance/evaluation-form/types";

import { EvaluationFormCard } from "./evaluation-form-card";

type EvaluationFormsListProps = {
  items: EvaluationFormItem[];
};

export function EvaluationFormsList({ items }: EvaluationFormsListProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">Evaluation Forms</p>
      {items.map((form) => (
        <EvaluationFormCard key={form.id} form={form} />
      ))}
    </section>
  );
}
