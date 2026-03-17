import type { UpcomingInterview } from "@/features/hr/exit/interviews/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type UpcomingInterviewCardProps = {
  item: UpcomingInterview;
};

export function UpcomingInterviewCard({ item }: UpcomingInterviewCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
            {item.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold tracking-[-0.3125px] text-black">{item.name}</p>
              <span className="inline-flex h-[18px] items-center rounded-[4px] border border-[#e5e5e5] px-1.5 text-[10px] text-black">
                {item.department}
              </span>
              <span className="ml-auto inline-flex h-[18px] items-center rounded-[4px] bg-primary px-1.5 text-[10px] text-white">
                {item.status}
              </span>
            </div>
            <p className="text-sm text-[#666]">{item.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 rounded-[4px] bg-[#f3f3f3] px-2 py-1.5">
          <Info label="Date" value={item.date} />
          <Info label="Time" value={item.time} />
          <Info label="Interviewer" value={item.interviewer} />
          <Info label="Location" value={item.location} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="h-8 rounded-[6px] text-xs">
            Send Reminder
          </Button>
          <Button size="sm" variant="outline" className="h-8 rounded-[6px] border-border bg-white text-xs text-black">
            Reschedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] leading-4 text-[#666]">{label}</p>
      <p className="text-sm font-semibold leading-5 text-black">{value}</p>
    </div>
  );
}
