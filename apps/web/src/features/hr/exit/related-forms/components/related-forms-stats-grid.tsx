import { FileText } from 'lucide-react';

import type { ExitRelatedFormStat } from '@/features/hr/exit/related-forms/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type RelatedFormsStatsGridProps = {
  items: ExitRelatedFormStat[];
};

export function RelatedFormsStatsGrid({ items }: RelatedFormsStatsGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="h-[106px] gap-0 rounded-[10px] border-border py-0 shadow-none"
        >
          <CardContent className="flex h-full items-center justify-between px-[26px] py-[25px]">
            <div>
              <p className="text-xs leading-5 text-[#666]">{item.label}</p>
              <p className="mt-1 text-[33px] font-semibold leading-8 tracking-[-0.3125px] text-black">
                {item.value}
              </p>
            </div>
            <FileText className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
