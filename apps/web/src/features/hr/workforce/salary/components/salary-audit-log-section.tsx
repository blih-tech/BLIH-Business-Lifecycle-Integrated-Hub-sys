import type { SalaryAuditLogItem } from '@/features/hr/workforce/salary/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type SalaryAuditLogSectionProps = {
  items: SalaryAuditLogItem[];
};

export function SalaryAuditLogSection({ items }: SalaryAuditLogSectionProps) {
  const firstCol = items.slice(0, 3);
  const secondCol = items.slice(3, 6);

  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm tracking-[-0.3125px] text-black">
          Salary Audit Log
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            {firstCol.map((item) => (
              <AuditRow key={item.id} item={item} />
            ))}
          </div>
          <div className="space-y-2">
            {secondCol.map((item) => (
              <AuditRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditRow({ item }: { item: SalaryAuditLogItem }) {
  return (
    <div className="rounded-[8px] border border-[#e5e5e5] bg-white px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-black">{item.employee}</p>
            <span className="inline-flex h-[22px] items-center rounded-[6px] border border-[#e5e5e5] px-[9px] text-xs text-black">
              {item.tag}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#666]">{item.amountLine}</p>
          <p className="text-sm text-[#666]">• {item.detail}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-black">{item.date}</p>
          <p className="text-xs text-[#666]">{item.by}</p>
        </div>
      </div>
    </div>
  );
}
