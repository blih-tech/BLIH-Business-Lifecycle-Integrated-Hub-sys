const frequentlyPostedJobs = [
  { id: 'full-stack', label: 'Full-stack Developer', value: 156 },
  { id: 'marketing', label: 'Marketing Manager', value: 144 },
  { id: 'graphic', label: 'Graphic Designer', value: 12 },
  { id: 'finance', label: 'Finance Executive', value: 5 },
];

export function FrequentlyPostedJobsCard() {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white p-6">
      <h2 className="text-base font-medium tracking-[-0.3125px] text-black">
        Frequently Posted Jobs
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {frequentlyPostedJobs.map((item) => (
          <div key={item.id} className="rounded-[8px] bg-[#f3f3f3] p-3">
            <p className="text-xs tracking-[-0.1504px] text-black">
              {item.label}
            </p>
            <p className="mt-3 text-[28px] font-semibold leading-6 tracking-[-0.3px] text-primary">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
