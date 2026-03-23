import { Award, CheckCircle2, Clock3, TrendingUp } from 'lucide-react';

import type { TrainingSkillsStat } from '@/features/hr/talent/training-skills/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type StatsCardProps = {
  item: TrainingSkillsStat;
};

export function StatsCard({ item }: StatsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#666]">{item.label}</p>
          {item.icon === 'clock' ? (
            <Clock3 className="h-4 w-4 text-primary" />
          ) : item.icon === 'check' ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : item.icon === 'trend' ? (
            <TrendingUp className="h-4 w-4 text-primary" />
          ) : (
            <Award className="h-4 w-4 text-primary" />
          )}
        </div>
        <p className="mt-1 text-[30px] font-semibold leading-8 text-black">
          {item.value}
        </p>
      </CardContent>
    </Card>
  );
}
