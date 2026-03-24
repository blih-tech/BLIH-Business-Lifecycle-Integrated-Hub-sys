import {
  allDisciplineCases,
  disciplineActionCases,
  disciplineStats,
} from '@/features/hr/talent/discipline/mock-data';
import {
  AllDisciplineCases,
  DisciplineActionRequired,
  DisciplineStatistics,
} from '@/features/hr/talent/discipline/components';

export * from '@/features/hr/talent/discipline/components';
export * from '@/features/hr/talent/discipline/types';

export function TalentDisciplineContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <DisciplineActionRequired items={disciplineActionCases} />
      <AllDisciplineCases items={allDisciplineCases} />
      <DisciplineStatistics items={disciplineStats} />
    </main>
  );
}
