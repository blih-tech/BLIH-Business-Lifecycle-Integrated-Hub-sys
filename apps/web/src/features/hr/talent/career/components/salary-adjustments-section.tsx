import type { SalaryAdjustmentRequest } from '@/features/hr/talent/career/types';

import { SalaryAdjustmentCard } from './salary-adjustment-card';

type SalaryAdjustmentsSectionProps = {
  items: SalaryAdjustmentRequest[];
};

export function SalaryAdjustmentsSection({
  items,
}: SalaryAdjustmentsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">
        Salary Adjustment Requests
      </p>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <SalaryAdjustmentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
