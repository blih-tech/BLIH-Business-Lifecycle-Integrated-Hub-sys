import type { TimesheetRow } from '@/features/hr/attendance/timesheet/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';

type TimesheetTableProps = {
  rows: TimesheetRow[];
  compact?: boolean;
};

export function TimesheetTable({ rows, compact = false }: TimesheetTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table
        className={cn(
          'min-w-[920px] border-separate border-spacing-0',
          compact ? 'text-xs' : 'text-sm',
        )}
      >
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">
              Name
            </TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">
              Hours Per Week
            </TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">
              Hours Per Month
            </TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">
              Overtime
            </TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">
              Leave Hours
            </TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary text-right">
              Billable Hours
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="h-[52px] border-b border-border hover:bg-muted/40"
            >
              <TableCell className="px-0">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                    {row.initials}
                  </div>
                  <p className="text-sm font-medium tracking-[-0.1504px] text-black">
                    {row.name}
                  </p>
                </div>
              </TableCell>
              <TableCell className="px-0 text-xs font-medium text-black">
                {row.metrics.hoursPerWeek}
              </TableCell>
              <TableCell className="px-0 text-xs font-medium text-black">
                {row.metrics.hoursPerMonth}
              </TableCell>
              <TableCell className="px-0 text-xs font-medium text-black">
                {row.metrics.overtime}
              </TableCell>
              <TableCell className="px-0 text-xs font-medium text-black">
                {row.metrics.leaveHours}
              </TableCell>
              <TableCell className="px-0 text-right text-xs font-medium text-black">
                {row.metrics.billableHours}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
