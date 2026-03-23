import type {
  ExitReasonItem,
  ResignationTrendPoint,
} from '@/features/hr/exit/overview/types';

import { MonthlyTurnoverTrendCard } from './monthly-turnover-trend-card';
import { TopExitReasonsCard } from './top-exit-reasons-card';

type TurnoverInsightsSectionProps = {
  reasons: ExitReasonItem[];
  trendData: ResignationTrendPoint[];
};

export function TurnoverInsightsSection({
  reasons,
  trendData,
}: TurnoverInsightsSectionProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <TopExitReasonsCard items={reasons} />
      <MonthlyTurnoverTrendCard data={trendData} />
    </section>
  );
}
