import {
  additionalBenefits,
  benefitsStats,
  departmentBenefitPoints,
  departmentBenefitSummaries,
  insuranceBenefits,
  insuranceSummary,
  monthlyAllowances,
  monthlyAllowancesSummary,
  performanceBonusSummaries,
  profitSharingSummaries,
  profitSharingTiers,
  retirementMetrics,
  retirementOverview,
  topRecipients,
} from "@/features/hr/workforce/benefits/mock-data";
import {
  AdditionalBenefitsSection,
  AnnualPerformanceBonusesSection,
  AnnualProfitSharingSection,
  BenefitsStatsGrid,
  BenefitsValueByDepartmentSection,
  InsuranceBenefitsSection,
  MonthlyAllowancesSection,
  RetirementBenefitsSection,
} from "@/features/hr/workforce/benefits/components";

export * from "@/features/hr/workforce/benefits/components";
export * from "@/features/hr/workforce/benefits/types";

export function WorkforceBenefitsContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <BenefitsStatsGrid items={benefitsStats} />
      <AnnualProfitSharingSection summaries={profitSharingSummaries} tiers={profitSharingTiers} />
      <AnnualPerformanceBonusesSection summaries={performanceBonusSummaries} recipients={topRecipients} />
      <MonthlyAllowancesSection
        totalLabel={monthlyAllowancesSummary.label}
        totalValue={monthlyAllowancesSummary.value}
        items={monthlyAllowances}
      />
      <InsuranceBenefitsSection
        totalLabel={insuranceSummary.label}
        totalValue={insuranceSummary.value}
        items={insuranceBenefits}
      />
      <RetirementBenefitsSection
        title={retirementOverview.title}
        subtitle={retirementOverview.subtitle}
        metrics={retirementMetrics}
      />
      <AdditionalBenefitsSection items={additionalBenefits} />
      <BenefitsValueByDepartmentSection data={departmentBenefitPoints} summaries={departmentBenefitSummaries} />
    </main>
  );
}
