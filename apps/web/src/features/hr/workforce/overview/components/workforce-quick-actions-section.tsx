import { CircleDollarSign, ClipboardList, FileClock, TrendingUp } from "lucide-react";

import type { WorkforceQuickAction } from "@/features/hr/workforce/overview/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type WorkforceQuickActionsSectionProps = {
  items: WorkforceQuickAction[];
};

export function WorkforceQuickActionsSection({ items }: WorkforceQuickActionsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-base tracking-[-0.3125px] text-black">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="h-[78px] flex-col gap-2 rounded-[6px] border-border bg-white text-sm font-medium text-black hover:bg-white"
            >
              {renderQuickActionIcon(item.icon)}
              {item.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function renderQuickActionIcon(icon: WorkforceQuickAction["icon"]) {
  if (icon === "salary") {
    return <ClipboardList className="h-4 w-4 text-primary" />;
  }

  if (icon === "budget") {
    return <TrendingUp className="h-4 w-4 text-primary" />;
  }

  if (icon === "expense") {
    return <FileClock className="h-4 w-4 text-primary" />;
  }

  return <CircleDollarSign className="h-4 w-4 text-primary" />;
}
