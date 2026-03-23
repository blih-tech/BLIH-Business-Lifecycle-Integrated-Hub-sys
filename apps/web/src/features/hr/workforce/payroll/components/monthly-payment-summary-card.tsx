import { Download } from 'lucide-react';

import type { MonthlyPaymentSummaryItem } from '@/features/hr/workforce/payroll/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

type MonthlyPaymentSummaryCardProps = {
  item: MonthlyPaymentSummaryItem;
};

export function MonthlyPaymentSummaryCard({
  item,
}: MonthlyPaymentSummaryCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-2.5 p-3.5">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold tracking-[-0.176px] text-black">
            {item.monthLabel}
          </p>
          <p className="text-xs text-[#666]">{item.employeeCount}</p>
        </div>

        <div className="space-y-1.5">
          <SummaryRow label="Total Gross" value={item.totalGross} />
          <SummaryRow label="Total Pension" value={item.totalPension} />
          <SummaryRow
            label="Total Net"
            value={item.totalNet}
            valueClassName="text-primary"
          />
          <SummaryRow
            label="Total Tax"
            value={item.totalTax}
            valueClassName="text-[#dc2626]"
          />
        </div>

        <div className="flex items-center gap-1.5 pt-0.5">
          <Button size="sm" className="h-8 flex-1 rounded-[6px] text-xs">
            View Payment History
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="h-8 w-8 rounded-[6px] border-[#e5e5e5] bg-white text-primary"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[8px] bg-[#f7f7f7] px-2.5 py-1.5">
      <p className="text-[11px] text-[#666]">{label}</p>
      <p
        className={`text-xs font-semibold tracking-[-0.15px] text-black ${valueClassName ?? ''}`}
      >
        {value}
      </p>
    </div>
  );
}
