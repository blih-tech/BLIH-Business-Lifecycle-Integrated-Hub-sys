import type { DisciplineCase } from "@/features/hr/talent/discipline/types";

import { DisciplineCaseCard } from "./discipline-case-card";

type AllDisciplineCasesProps = {
  items: DisciplineCase[];
};

export function AllDisciplineCases({ items }: AllDisciplineCasesProps) {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium tracking-[-0.176px] text-black">All Discipline Cases</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        {items.map((item) => (
          <DisciplineCaseCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
