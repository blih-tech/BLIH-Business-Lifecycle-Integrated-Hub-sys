import { useMemo } from 'react';
import {
  CreateNewFormCard,
  CreateWithAICard,
  FormCard,
} from '@/features/hr/recruitment/applicant-forms/components';
import { useJobs } from '@/features/hr/recruitment/requests/hooks';

export * from '@/features/hr/recruitment/applicant-forms/components';
export * from '@/features/hr/recruitment/applicant-forms/types';

export function RecruitmentApplicantFormsContent() {
  const { data: jobs = [] } = useJobs();

  const createdApplicantForms = useMemo(() => {
    const grouped = jobs.reduce<
      Record<
        string,
        {
          id: string;
          title: string;
          department: string;
          createdAt: string;
          usedInJobs: number;
        }
      >
    >((acc, job) => {
      if (!job.applicationForm) return acc;
      const key = job.applicationForm.id;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          title: `${job.job.title} Form`,
          department: job.requestForm?.department ?? job.job.departmentId,
          createdAt: new Date(job.job.createdAt).toLocaleDateString(),
          usedInJobs: 0,
        };
      }
      acc[key].usedInJobs += 1;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [jobs]);

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-12 px-4 py-5 md:px-5 md:py-6">
      <section className="grid gap-4 md:grid-cols-2">
        <CreateNewFormCard />
        <CreateWithAICard />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-[-0.3125px] text-black">
            Previously Created Forms
          </h2>
          <p className="text-sm text-[#666]">
            Find applicant-to-fill forms with their job positions.
          </p>
        </div>

        {createdApplicantForms.length > 0 ? (
          <div className="space-y-3">
            {createdApplicantForms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        ) : (
          <div className="flex h-[240px] items-center justify-center rounded-[12px] border border-[#e5e5e5] bg-[#f8f8f8]">
            <p className="text-sm text-[#666]">
              No forms yet. Create or Generate using AI.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
