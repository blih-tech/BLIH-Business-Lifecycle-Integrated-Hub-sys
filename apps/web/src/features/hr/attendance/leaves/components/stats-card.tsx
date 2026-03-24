import { CircleCheckBig, Clock3 } from 'lucide-react';

import type { AttendanceRequestStat } from '@/features/hr/attendance/leaves/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type StatsCardProps = AttendanceRequestStat;

function IconByType({ icon }: { icon: AttendanceRequestStat['icon'] }) {
  if (icon === 'clock-3') return <Clock3 className="h-4 w-4 text-primary" />;
  return <CircleCheckBig className="h-4 w-4 text-primary" />;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <p className="ui-label text-[#666]">{label}</p>
          <IconByType icon={icon} />
        </div>
        <p className="mt-1 text-[36px] font-semibold leading-9 tracking-[0.0703px] text-black">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
