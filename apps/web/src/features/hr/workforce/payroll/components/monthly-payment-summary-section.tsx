import { Download } from 'lucide-react';

import type { MonthlyPaymentSummaryItem } from '@/features/hr/workforce/payroll/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

import { MonthlyPaymentSummaryCard } from './monthly-payment-summary-card';

type MonthlyPaymentSummarySectionProps = {
  items: MonthlyPaymentSummaryItem[];
};

export function MonthlyPaymentSummarySection({
  items,
}: MonthlyPaymentSummarySectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium tracking-[-0.176px] text-black">
            Monthly Payment Summary
          </p>
          <Button size="sm" className="h-8 rounded-[6px] px-3 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export All
          </Button>
        </div>
        <div className="grid gap-2.5 lg:grid-cols-3">
          {items.map((item) => (
            <MonthlyPaymentSummaryCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
