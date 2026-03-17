import type { InsuranceBenefitItem } from "@/features/hr/workforce/benefits/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type InsuranceBenefitCardProps = {
  item: InsuranceBenefitItem;
};

export function InsuranceBenefitCard({ item }: InsuranceBenefitCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border border-[#e5e5e5] py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[-0.2px] text-black">{item.title}</p>
            <p className="text-xs text-[#666]">{item.subtitle}</p>
          </div>
          <p className="text-base font-semibold text-primary">{item.monthlyCost}</p>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <MiniMetric label="Employer" value={item.employerShare} />
          <MiniMetric label="Employee" value={item.employeeShare} />
          <MiniMetric label="Enrolled" value={item.enrolled} />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] bg-[#f3f3f3] px-2 py-2">
      <p className="text-[11px] text-[#666]">{label}</p>
      <p className="text-sm font-semibold text-black">{value}</p>
    </div>
  );
}
