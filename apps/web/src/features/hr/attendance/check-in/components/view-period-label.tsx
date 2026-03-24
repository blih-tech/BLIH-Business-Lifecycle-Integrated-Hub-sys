import { CalendarDays } from 'lucide-react';

import type { CheckinViewMode } from '@/features/hr/attendance/check-in/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type ViewPeriodLabelProps = {
  viewMode: CheckinViewMode;
  dailyDate: string;
  onDailyDateChange: (value: string) => void;
  dailyDateOptions: ReadonlyArray<{ value: string; label: string }>;
};

export function ViewPeriodLabel({
  viewMode,
  dailyDate,
  onDailyDateChange,
  dailyDateOptions,
}: ViewPeriodLabelProps) {
  if (viewMode === 'daily') {
    return (
      <div className="flex items-center gap-2 rounded-[6px] border border-border px-3 py-2 text-xs text-black">
        <span className="text-muted-foreground">Daily View:</span>
        <Select value={dailyDate} onValueChange={onDailyDateChange}>
          <SelectTrigger
            size="sm"
            className="h-7 min-w-[205px] rounded-[4px] border-0 bg-transparent px-1 text-xs text-black shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dailyDateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    );
  }

  if (viewMode === 'weekly') {
    return (
      <div className="flex items-center gap-2 rounded-[6px] border border-border px-3 py-2 text-xs text-black">
        <span className="text-muted-foreground">Weekly View:</span>
        <span className="font-medium text-black">W2</span>
        <span>Tuesday, Dec 14, 2025</span>
        <span className="text-muted-foreground">to</span>
        <span>Monday, Dec 21, 2025</span>
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-[6px] border border-border px-3 py-2 text-xs text-black">
      <span className="text-muted-foreground">Monthly View:</span>
      <span className="font-medium text-black">M11</span>
      <span>Tuesday, Nov 14, 2025</span>
      <span className="text-muted-foreground">to</span>
      <span>Monday, Dec 21, 2025</span>
      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}
