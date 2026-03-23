import type { DepartmentAttritionItem } from "@/features/hr/exit/overview/types";

import { DepartmentAttritionCard } from "./department-attrition-card";

type DepartmentAttritionAnalysisSectionProps = {
  items: DepartmentAttritionItem[];
};

export function DepartmentAttritionAnalysisSection({ items }: DepartmentAttritionAnalysisSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">Department Attrition Analysis</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <DepartmentAttritionCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
