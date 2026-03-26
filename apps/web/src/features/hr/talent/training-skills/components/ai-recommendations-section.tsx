import type { TrainingRecommendation } from "@/features/hr/talent/training-skills/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { RecommendationCard } from "./recommendation-card";

type AiRecommendationsSectionProps = {
  urgentSkillGaps: TrainingRecommendation[];
  emergingNeeds: TrainingRecommendation[];
  certificationOpportunities: TrainingRecommendation[];
};

export function AiRecommendationsSection({
  urgentSkillGaps,
  emergingNeeds,
  certificationOpportunities,
}: AiRecommendationsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">AI Training &amp; Skills Recommendations</p>
      <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
        <CardContent className="grid grid-cols-1 gap-4 p-3 xl:grid-cols-2">
          <div className="space-y-3">
            <p className="text-base font-semibold text-black">Urgent Skill Gaps</p>
            {urgentSkillGaps.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-base font-semibold text-black">Emerging Training Needs</p>
            {emergingNeeds.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
            <p className="pt-2 text-base font-semibold text-black">Certification Opportunities</p>
            {certificationOpportunities.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
