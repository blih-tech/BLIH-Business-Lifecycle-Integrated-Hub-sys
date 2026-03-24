import {
  activeCultureInitiatives,
  cultureImpactMetrics,
  culturePolicies,
} from '@/features/hr/talent/culture/mock-data';
import {
  ActiveInitiativesHeader,
  CultureHeader,
  CultureImpactMetrics,
  CultureInitiativesGrid,
  PoliciesGrid,
} from '@/features/hr/talent/culture/components';

export * from '@/features/hr/talent/culture/components';
export * from '@/features/hr/talent/culture/types';

export function TalentCultureContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <CultureHeader />
      <PoliciesGrid items={culturePolicies} />
      <ActiveInitiativesHeader totalPrograms={6} />
      <CultureInitiativesGrid items={activeCultureInitiatives} />
      <CultureImpactMetrics items={cultureImpactMetrics} />
    </main>
  );
}
