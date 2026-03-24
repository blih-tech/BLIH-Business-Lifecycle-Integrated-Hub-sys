'use client';

import { Search } from 'lucide-react';

import type { EmployeeClearanceItem } from '@/features/hr/exit/documents/types';
import { Input } from '@/shared/components/ui/input';

import { EmployeeClearanceCard } from './employee-clearance-card';

type EmployeeDocumentClearanceSectionProps = {
  items: EmployeeClearanceItem[];
};

export function EmployeeDocumentClearanceSection({
  items,
}: EmployeeDocumentClearanceSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-medium tracking-[-0.176px] text-black">
          Employee Document Clearance
        </p>
        <div className="relative w-full sm:w-[184px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary" />
          <Input
            className="h-8 rounded-[6px] border-[#e5e5e5] pl-8 text-xs"
            placeholder="Search"
          />
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <EmployeeClearanceCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
