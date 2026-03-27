import type { CultureImpactMetric } from "@/features/hr/talent/culture/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type CultureImpactMetricsProps = {
  items: CultureImpactMetric[];
};

export function CultureImpactMetrics({ items }: CultureImpactMetricsProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-3">
        <p className="text-base font-medium tracking-[-0.176px] text-black">Culture Impact Metrics</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-[8px] bg-[#f3f3f3] px-4 py-3 text-center">
              <p className="text-[40px] font-bold leading-9 tracking-[0.3955px] text-primary">{item.value}</p>
              <p className="mt-1 text-sm text-[#666]">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
