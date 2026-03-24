import type { ExitReasonItem } from '@/features/hr/exit/overview/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type TopExitReasonsCardProps = {
  items: ExitReasonItem[];
};

const MAX_REASON_VALUE = 20;

export function TopExitReasonsCard({ items }: TopExitReasonsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm font-medium text-black">
          Top Exit Reasons (Last 12 Months)
        </p>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[72px_1fr] items-center gap-2"
            >
              <p className="text-[10px] leading-3 text-[#666]">{item.label}</p>
              <div className="relative h-5 border-b border-dashed border-[#d6d6d6]">
                <div
                  className="absolute left-0 top-1/2 h-3 -translate-y-1/2 bg-primary"
                  style={{
                    width: `${Math.min((item.value / MAX_REASON_VALUE) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
