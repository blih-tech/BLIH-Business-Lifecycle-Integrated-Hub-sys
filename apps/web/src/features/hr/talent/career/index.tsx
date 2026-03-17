import {
  careerStats,
  previousPromotionRequests,
  promotionRequests,
  salaryAdjustmentRequests,
} from "@/features/hr/talent/career/mock-data";
import {
  PreviousPromotionSection,
  PromotionRequestsSection,
  SalaryAdjustmentsSection,
  StatsGrid,
} from "@/features/hr/talent/career/components";

export * from "@/features/hr/talent/career/components";
export * from "@/features/hr/talent/career/types";

export function TalentCareerContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={careerStats} />
      <PromotionRequestsSection items={promotionRequests} />
      <SalaryAdjustmentsSection items={salaryAdjustmentRequests} />
      <div className="pt-16">
        <PreviousPromotionSection items={previousPromotionRequests} />
      </div>
    </main>
  );
}
