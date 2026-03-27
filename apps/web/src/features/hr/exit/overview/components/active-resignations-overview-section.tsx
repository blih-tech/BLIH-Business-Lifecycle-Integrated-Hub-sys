import type { ActiveResignation } from "@/features/hr/exit/overview/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { ActiveResignationCard } from "./active-resignation-card";

type ActiveResignationsOverviewSectionProps = {
  items: ActiveResignation[];
};

export function ActiveResignationsOverviewSection({ items }: ActiveResignationsOverviewSectionProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-base font-medium tracking-[-0.176px] text-black">Active Resignations Overview</p>
        <div className="space-y-3">
          {items.map((item) => (
            <ActiveResignationCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
