import { Clock3 } from "lucide-react";

import type { CheckinRow, CheckinStampValue } from "@/features/hr/attendance/check-in/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

type CheckinTableProps = {
  rows: CheckinRow[];
  compact?: boolean;
};

function StatusPill({ status }: { status: CheckinRow["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex h-[22px] min-w-[85px] items-center justify-center rounded-[4px] bg-primary px-2 py-0.5 text-[11px] font-medium text-white">
        Completed
      </span>
    );
  }

  if (status === "in-progress") {
    return (
      <span className="inline-flex h-[22px] min-w-[85px] items-center justify-center rounded-[4px] border border-primary bg-white px-2 py-0.5 text-[11px] font-medium text-primary">
        In-Progress
      </span>
    );
  }

  return (
    <span className="inline-flex h-[22px] min-w-[85px] items-center justify-center rounded-[4px] border border-primary bg-[#f3f3f3] px-2 py-0.5 text-[11px] font-medium text-black">
      Missed
    </span>
  );
}

function StampCell({ value }: { value: CheckinStampValue }) {
  if (value === "Missed") {
    return (
      <span className="inline-flex h-[18px] min-w-[72px] items-center justify-center rounded-[3px] border border-primary bg-[#f3f3f3] px-2 text-[10px] font-medium text-black">
        Missed
      </span>
    );
  }

  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-[13px] tracking-[-0.1504px] text-black">
      <Clock3 className="h-3 w-3 text-primary" />
      {value}
    </span>
  );
}

export function CheckinTable({ rows, compact = false }: CheckinTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className={cn("min-w-[920px] border-separate border-spacing-0", compact ? "text-xs" : "text-sm")}>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">Name</TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">Department</TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">Mor-In</TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">Lun-Out</TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">Lun-In</TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary">Aft-out</TableHead>
            <TableHead className="h-8 px-0 text-[10px] uppercase tracking-wide text-primary text-right">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="h-[52px] border-b border-border hover:bg-muted/40">
              <TableCell className="px-0">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                    {row.initials}
                  </div>
                  <p className="text-sm font-medium tracking-[-0.1504px] text-black">{row.name}</p>
                </div>
              </TableCell>
              <TableCell className="px-0 text-xs font-medium text-black">{row.department}</TableCell>
              <TableCell className="px-2"><StampCell value={row.stamps.morIn} /></TableCell>
              <TableCell className="px-2"><StampCell value={row.stamps.lunOut} /></TableCell>
              <TableCell className="px-2"><StampCell value={row.stamps.lunIn} /></TableCell>
              <TableCell className="px-2"><StampCell value={row.stamps.aftOut} /></TableCell>
              <TableCell className="px-0 text-right">
                <StatusPill status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
