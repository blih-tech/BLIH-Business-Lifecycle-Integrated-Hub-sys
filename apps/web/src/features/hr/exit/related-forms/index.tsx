import {
  exitInterviewForm,
  exitRelatedFormStats,
  exitTemplateForms,
} from '@/features/hr/exit/related-forms/mock-data';
import {
  FormManagementHeading,
  FormManagementSection,
  RelatedFormsStatsGrid,
} from '@/features/hr/exit/related-forms/components';

export * from '@/features/hr/exit/related-forms/components';
export * from '@/features/hr/exit/related-forms/types';

export function ExitRelatedFormsContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <RelatedFormsStatsGrid items={exitRelatedFormStats} />
      <FormManagementHeading />
      <FormManagementSection
        interviewForm={exitInterviewForm}
        templates={exitTemplateForms}
      />
    </main>
  );
}
