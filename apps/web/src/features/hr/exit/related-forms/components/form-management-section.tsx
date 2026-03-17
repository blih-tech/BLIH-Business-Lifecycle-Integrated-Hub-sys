import type { ExitInterviewFormItem, ExitTemplateFormItem } from "@/features/hr/exit/related-forms/types";

import { InterviewFormCard } from "./interview-form-card";
import { TemplateFormCard } from "./template-form-card";

type FormManagementSectionProps = {
  interviewForm: ExitInterviewFormItem;
  templates: ExitTemplateFormItem[];
};

export function FormManagementSection({ interviewForm, templates }: FormManagementSectionProps) {
  return (
    <section className="space-y-4">
      <InterviewFormCard item={interviewForm} />
      {templates.map((template) => (
        <TemplateFormCard key={template.id} item={template} />
      ))}
    </section>
  );
}
