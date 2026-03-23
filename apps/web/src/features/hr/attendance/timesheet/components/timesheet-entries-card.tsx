import type {
  TimesheetRow,
  TimesheetSection,
  TimesheetViewMode,
} from '@/features/hr/attendance/timesheet/types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

import { TimesheetTable } from './timesheet-table';
import { ViewPeriodLabel } from './view-period-label';

type TimesheetEntriesCardProps = {
  viewMode: TimesheetViewMode;
  rows: TimesheetRow[];
  sections: TimesheetSection[];
  dailyDate: string;
  onDailyDateChange: (value: string) => void;
  dailyDateOptions: ReadonlyArray<{ value: string; label: string }>;
};

export function TimesheetEntriesCard({
  viewMode,
  rows,
  sections,
  dailyDate,
  onDailyDateChange,
  dailyDateOptions,
}: TimesheetEntriesCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm tracking-[-0.3125px] text-black">Timesheet</p>
          <ViewPeriodLabel
            viewMode={viewMode}
            dailyDate={dailyDate}
            onDailyDateChange={onDailyDateChange}
            dailyDateOptions={dailyDateOptions}
          />
        </div>

        {viewMode === 'daily' ? (
          <TimesheetTable rows={rows} />
        ) : viewMode === 'weekly' ? (
          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.id}>
                <div className="mb-3 flex items-center gap-3">
                  <p className="text-sm font-medium text-black">
                    {section.title}
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <TimesheetTable rows={section.rows} compact />
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-7">
            {sections.map((section) => (
              <div key={section.id} className="flex gap-3">
                <div className="hidden w-[34px] pt-9 md:block">
                  <div
                    className="inline-flex min-h-[64px] items-center justify-center rounded-[6px] border border-border bg-[#f3f3f3] px-1 text-[10px] font-medium text-muted-foreground"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                    }}
                  >
                    {section.railLabel ?? section.subtitle ?? section.title}
                  </div>
                </div>

                <section className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <p className="text-sm font-medium text-black">
                      {section.title}
                    </p>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  {section.subtitle ? (
                    <p className="mb-2 text-xs text-muted-foreground">
                      {section.subtitle}
                    </p>
                  ) : null}
                  <TimesheetTable rows={section.rows} compact />
                </section>
              </div>
            ))}
          </div>
        )}

        {!rows.length && !sections.length ? (
          <p className={cn('py-10 text-center text-sm text-muted-foreground')}>
            No timesheet entries found.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
