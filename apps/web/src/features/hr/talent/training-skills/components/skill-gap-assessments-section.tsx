import type { SkillGapAssessment } from '@/features/hr/talent/training-skills/types';

import { SkillGapCard } from './skill-gap-card';

type SkillGapAssessmentsSectionProps = {
  items: SkillGapAssessment[];
};

export function SkillGapAssessmentsSection({
  items,
}: SkillGapAssessmentsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">
        Skill Gap Assessments
      </p>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <SkillGapCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
