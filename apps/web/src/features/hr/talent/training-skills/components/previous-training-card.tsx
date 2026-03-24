import { Award } from 'lucide-react';

import type { PreviousTraining } from '@/features/hr/talent/training-skills/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type PreviousTrainingCardProps = {
  item: PreviousTraining;
};

export function PreviousTrainingCard({ item }: PreviousTrainingCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#4a5565] text-[10px] font-semibold text-white">
              {item.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-black">{item.name}</p>
              <p className="text-[10px] text-[#666]">{item.department}</p>
            </div>
          </div>
          <Award className="h-4 w-4 text-primary" />
        </div>

        <p className="text-sm font-medium text-black">{item.trainingTitle}</p>

        <div className="rounded-[4px] bg-[#f3f3f3] p-2">
          <p className="text-[10px] text-[#666]">{item.certificationLabel}</p>
          <p className="text-xs font-medium text-black">
            {item.certificationValue}
          </p>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-[#666]">Score:</p>
            <p className="font-semibold text-primary">{item.score}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#666]">Completed:</p>
            <p className="font-medium text-black">{item.completed}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
