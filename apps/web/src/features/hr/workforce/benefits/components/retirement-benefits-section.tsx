import type { RetirementBenefitMetric } from '@/features/hr/workforce/benefits/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type RetirementBenefitsSectionProps = {
  title: string;
  subtitle: string;
  metrics: RetirementBenefitMetric[];
};

export function RetirementBenefitsSection({
  title,
  subtitle,
  metrics,
}: RetirementBenefitsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-base tracking-[-0.3125px] text-black">
          Retirement Benefits
        </p>
        <div className="grid gap-4 md:grid-cols-[1.1fr_1.5fr]">
          <div className="rounded-[10px] bg-[#eaf2ff] px-4 py-4">
            <p className="text-sm font-semibold text-black">{title}</p>
            <p className="text-xs text-[#666]">{subtitle}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="rounded-[10px] border border-[#e5e5e5] px-3 py-3"
              >
                <p className="text-[11px] text-[#666]">{metric.label}</p>
                <p
                  className={`text-lg font-semibold ${metric.accent ? 'text-primary' : 'text-black'}`}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
