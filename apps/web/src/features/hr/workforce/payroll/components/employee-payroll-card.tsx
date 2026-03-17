import type { EmployeePayrollItem, PayrollMetric } from "@/features/hr/workforce/payroll/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type EmployeePayrollCardProps = {
  item: EmployeePayrollItem;
};

export function EmployeePayrollCard({ item }: EmployeePayrollCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-semibold text-white">{item.initials}</div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold tracking-[-0.176px] text-black">{item.name}</p>
              <span className="inline-flex h-[18px] items-center rounded-[5px] bg-[#ecfdf3] px-1.5 text-[10px] font-medium text-[#027a48]">
                {item.department}
              </span>
            </div>
            <p className="text-xs text-[#666]">{item.role}</p>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {item.topMetrics.map((metric) => (
            <MetricCell key={metric.label} metric={metric} />
          ))}
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {item.bottomMetrics.map((metric) => (
            <MetricCell key={metric.label} metric={metric} />
          ))}
        </div>

        <Button size="sm" className="h-8 w-full rounded-[6px] text-xs">
          View Payment History
        </Button>
      </CardContent>
    </Card>
  );
}

function MetricCell({ metric }: { metric: PayrollMetric }) {
  const toneClass =
    metric.tone === "danger" ? "text-[#dc2626]" : metric.tone === "success" ? "text-[#027a48]" : "text-black";

  return (
    <div className={metric.highlight ? "rounded-[8px] bg-[#eff4ff] p-2" : "rounded-[8px] bg-[#f7f7f7] p-2"}>
      <p className="text-[10px] leading-4 text-[#666]">{metric.label}</p>
      <p className={`text-sm font-semibold tracking-[-0.15px] ${toneClass}`}>{metric.value}</p>
    </div>
  );
}
