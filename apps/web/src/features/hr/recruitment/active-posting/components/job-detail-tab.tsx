import type { ActiveJobItem } from "@/features/hr/recruitment/active-posting/types";

type JobDetailTabProps = {
  job: ActiveJobItem;
};

export function JobDetailTab({ job }: JobDetailTabProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <section className="space-y-2">
          <h3 className="ui-h4 text-black">Job Overview</h3>
          <p className="text-sm font-normal leading-5 tracking-[-0.1504px] text-[#666]">{job.summary}</p>
        </section>

        <section className="space-y-2">
          <h3 className="ui-h4 text-black">Requirements</h3>
          <ul className="space-y-1">
            {job.requirements.map((item, index) => (
              <li
                key={`requirement-${index}-${item}`}
                className="flex items-start gap-2 text-sm font-normal leading-5 tracking-[-0.1504px] text-[#666]"
              >
                <span className="mt-0.5 text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[8px] bg-[#f3f3f3] p-3">
            <p className="text-xs font-normal leading-4 text-[#666]">Posted</p>
            <p className="mt-1 text-sm font-medium leading-5 tracking-[-0.1504px] text-black">{job.postedAt}</p>
          </div>
          <div className="rounded-[8px] bg-[#f3f3f3] p-3">
            <p className="text-xs font-normal leading-4 text-[#666]">Closed</p>
            <p className="mt-1 text-sm font-medium leading-5 tracking-[-0.1504px] text-black">{job.closesAt}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <section className="space-y-2">
          <h3 className="ui-h4 text-black">Key Responsibilities</h3>
          <div className="space-y-1">
            {job.keyResponsibilities.map((item, index) => (
              <p key={`responsibility-${index}-${item}`} className="text-sm font-normal leading-5 tracking-[-0.1504px] text-[#666]">
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="ui-h4 text-black">Benefits</h3>
          <ul className="space-y-1">
            {job.benefits.map((benefit, index) => (
              <li
                key={`benefit-${index}-${benefit}`}
                className="flex items-start gap-2 text-sm font-normal leading-5 tracking-[-0.1504px] text-[#666]"
              >
                <span className="mt-0.5 text-primary">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
