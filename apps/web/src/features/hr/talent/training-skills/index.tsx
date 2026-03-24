import {
  certificationOpportunities,
  emergingNeeds,
  previousTrainings,
  skillGapAssessments,
  trainingRequests,
  trainingSkillsStats,
  urgentSkillGaps,
} from '@/features/hr/talent/training-skills/mock-data';
import {
  AiRecommendationsSection,
  PreviousTrainingsSection,
  SkillGapAssessmentsSection,
  StatsGrid,
  TrainingRequestsSection,
} from '@/features/hr/talent/training-skills/components';

export * from '@/features/hr/talent/training-skills/components';
export * from '@/features/hr/talent/training-skills/types';

export function TalentTrainingSkillsContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={trainingSkillsStats} />
      <TrainingRequestsSection items={trainingRequests} />
      <PreviousTrainingsSection items={previousTrainings} />
      <SkillGapAssessmentsSection items={skillGapAssessments} />
      <AiRecommendationsSection
        urgentSkillGaps={urgentSkillGaps}
        emergingNeeds={emergingNeeds}
        certificationOpportunities={certificationOpportunities}
      />
    </main>
  );
}
