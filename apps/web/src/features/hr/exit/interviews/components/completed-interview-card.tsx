import type { CompletedInterview } from '@/features/hr/exit/interviews/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type CompletedInterviewCardProps = {
  item: CompletedInterview;
};

export function CompletedInterviewCard({ item }: CompletedInterviewCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-base font-semibold text-white">
            {item.initials}
          </div>
          <div>
            <p className="text-base font-medium tracking-[-0.3125px] text-black">
              {item.name}
            </p>
            <p className="text-sm text-[#666]">{item.role}</p>
          </div>
          <span className="ml-2 inline-flex h-5 items-center rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1.5 text-[10px] font-semibold uppercase text-primary">
            {item.department}
          </span>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_432px]">
          <div className="grid grid-cols-4 gap-3 rounded-[8px] bg-[#f5f5f5] px-4 py-2">
            <DataCell label="Interview Date" value={item.interviewDate} />
            <DataCell label="Interviewer" value={item.interviewer} />
            <DataCell label="Rating" value={item.rating} isPrimary />
            <DataCell label="Would Recommend" value={item.wouldRecommend} />
          </div>
          <div className="rounded-[8px] border border-primary bg-[#f3f3f3] px-4 py-2">
            <p className="text-base font-semibold tracking-[-0.3125px] text-black">
              Remarks:
            </p>
            <p className="text-sm leading-5 tracking-[-0.1504px] text-[rgba(0,0,0,0.8)]">
              {item.remarks}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DataCell({
  label,
  value,
  isPrimary,
}: {
  label: string;
  value: string;
  isPrimary?: boolean;
}) {
  return (
    <div>
      <p className="text-xs leading-4 text-[#666]">{label}</p>
      <p
        className={`text-sm font-semibold leading-5 ${isPrimary ? 'text-primary' : 'text-black'}`}
      >
        {value}
      </p>
    </div>
  );
}
