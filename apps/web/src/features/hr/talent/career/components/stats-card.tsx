import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react';

import type { CareerStatItem } from '@/features/hr/talent/career/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type StatsCardProps = {
  item: CareerStatItem;
};

export function StatsCard({ item }: StatsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#666]">{item.label}</p>
          {item.trendIcon === 'up' ? (
            <ArrowUp className="h-4 w-4 text-primary" />
          ) : item.trendIcon === 'down' ? (
            <ArrowDown className="h-4 w-4 text-[#e7000b]" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-primary" />
          )}
        </div>
        <p className="mt-1 text-[30px] font-semibold leading-8 text-black">
          {item.value}
        </p>
      </CardContent>
    </Card>
  );
}
