import { allRelatedForms, relatedFormsStats, relatedFormTypes } from "@/features/hr/talent/related-forms/mock-data";
import {
  AllFormsSection,
  FormManagementHeader,
  FormTypesSection,
  RelatedFormsStatsGrid,
} from "@/features/hr/talent/related-forms/components";

export * from "@/features/hr/talent/related-forms/components";
export * from "@/features/hr/talent/related-forms/types";

export function TalentRelatedFormsContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-3.5 px-4 py-4 md:px-5 md:py-5">
      <FormManagementHeader />
      <FormTypesSection items={relatedFormTypes} />
      <RelatedFormsStatsGrid items={relatedFormsStats} />
      <AllFormsSection items={allRelatedForms} />
    </main>
  );
}
