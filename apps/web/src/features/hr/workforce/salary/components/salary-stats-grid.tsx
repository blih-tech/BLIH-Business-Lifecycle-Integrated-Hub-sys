import { CircleDollarSign, FileText, TrendingUp } from "lucide-react";

import type { SalaryStat } from "@/features/hr/workforce/salary/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type SalaryStatsGridProps = {
  items: SalaryStat[];
};

export function SalaryStatsGrid({ items }: SalaryStatsGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.id} className="gap-0 rounded-[12px] border-border py-0 shadow-none">
          <CardContent className="flex items-center justify-between p-[25px]">
            <div>
              <p className="text-sm leading-5 tracking-[-0.1504px] text-[#666]">{item.label}</p>
              <p className="mt-1 text-[24px] font-semibold leading-8 tracking-[0.0703px] text-black">{item.value}</p>
            </div>
            <div className="text-primary">{renderIcon(item.icon)}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function renderIcon(icon: SalaryStat["icon"]) {
  if (icon === "requests") {
    return <FileText className="h-6 w-6" />;
  }
  if (icon === "trend") {
    return <TrendingUp className="h-6 w-6" />;
  }
  return <CircleDollarSign className="h-6 w-6" />;
}
