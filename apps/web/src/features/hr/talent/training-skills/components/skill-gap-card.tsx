import type { SkillGapAssessment } from '@/features/hr/talent/training-skills/types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

type SkillGapCardProps = {
  item: SkillGapAssessment;
};

export function SkillGapCard({ item }: SkillGapCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
              {item.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-black">{item.name}</p>
                <span className="rounded-[4px] border border-border px-1.5 py-0.5 text-[9px] text-black">
                  {item.department}
                </span>
                <span
                  className={cn(
                    'rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium text-white',
                    item.status === 'ongoing' ? 'bg-primary' : 'bg-[#4a5565]',
                  )}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-[11px] text-[#666]">{item.skillArea}</p>
            </div>
          </div>
        </div>

        {item.progress !== undefined ? (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[11px] font-medium text-black">Progress</p>
              <p className="text-[11px] font-semibold text-primary">
                {item.progress}%
              </p>
            </div>
            <div className="h-[6px] w-full rounded-full bg-[#dbe6fb]">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            {item.dueDate ? (
              <p className="mt-1 text-[10px] text-[#666]">
                Due: {item.dueDate}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-[4px] bg-[#f3f3f3] p-2">
          <p className="mb-1 text-[10px] font-medium text-black">
            Identified Skill Gaps
          </p>
          <div className="flex flex-wrap gap-1">
            {item.identifiedGaps.map((gap) => (
              <span
                key={gap}
                className="rounded-[4px] border border-primary/40 bg-white px-1.5 py-0.5 text-[9px] text-primary"
              >
                {gap}
              </span>
            ))}
          </div>
        </div>

        {item.recommendedActions?.length ? (
          <div className="rounded-[4px] bg-[#dbe6fb] p-2">
            <p className="mb-1 text-[10px] font-medium text-black">
              Recommended Actions
            </p>
            <ul className="space-y-0.5 text-[10px] text-[#4a5565]">
              {item.recommendedActions.map((action) => (
                <li key={action}>- {action}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
