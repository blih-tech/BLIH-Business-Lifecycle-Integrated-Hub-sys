import { Target, Users, Zap } from "lucide-react";

import type { InsightCard } from "@/features/hr/performance/overview/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type InsightCardsRowProps = {
  items: InsightCard[];
};

function IconByType({ icon }: { icon: InsightCard["icon"] }) {
  if (icon === "zap") return <Zap className="h-4 w-4 text-primary" />;
  if (icon === "users") return <Users className="h-4 w-4 text-primary" />;
  return <Target className="h-4 w-4 text-primary" />;
}

export function InsightCardsRow({ items }: InsightCardsRowProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="gap-0 rounded-[10px] border-border py-0 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <IconByType icon={item.icon} />
              <div className="min-w-0">
                <p className="text-[10px] text-[#666]">{item.title}</p>
                <p className="text-xs font-semibold text-black">{item.value}</p>
                <p className="text-[10px] text-primary">{item.detail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
