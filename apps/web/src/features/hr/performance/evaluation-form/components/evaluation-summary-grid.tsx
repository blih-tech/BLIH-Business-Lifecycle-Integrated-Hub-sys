import { CircleCheckBig, FileText } from 'lucide-react';

import type { EvaluationSummaryStat } from '@/features/hr/performance/evaluation-form/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type EvaluationSummaryGridProps = {
  items: EvaluationSummaryStat[];
};

export function EvaluationSummaryGrid({ items }: EvaluationSummaryGridProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="gap-0 rounded-[10px] border-border py-0 shadow-none"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#666]">{item.label}</p>
              {item.icon === 'circle-check' ? (
                <CircleCheckBig className="h-4 w-4 text-primary" />
              ) : (
                <FileText className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="mt-1 text-[30px] font-semibold leading-8 text-black">
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
