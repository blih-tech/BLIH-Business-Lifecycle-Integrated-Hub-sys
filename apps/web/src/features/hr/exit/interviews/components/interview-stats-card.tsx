import { CalendarDays, MessageSquareText, TrendingUp } from 'lucide-react';

import type { ExitInterviewStat } from '@/features/hr/exit/interviews/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type InterviewStatsCardProps = {
  item: ExitInterviewStat;
};

export function InterviewStatsCard({ item }: InterviewStatsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[#666]">{item.label}</p>
            <p className="mt-1 text-[34px] font-semibold leading-8 text-black">
              {item.value}
            </p>
          </div>
          <div className="text-primary">{renderIcon(item.icon)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderIcon(icon: ExitInterviewStat['icon']) {
  if (icon === 'rating') {
    return <TrendingUp className="h-4 w-4" />;
  }
  if (icon === 'completed') {
    return <MessageSquareText className="h-4 w-4" />;
  }
  return <CalendarDays className="h-4 w-4" />;
}
