import { Sparkles, TrendingUp } from 'lucide-react';

import type { KpiItem } from '@/features/hr/performance/kpis/types';
import { Card, CardContent } from '@/shared/components/ui/card';

import { KpiTrendBars } from './kpi-trend-bars';

type KpiCardProps = {
  item: KpiItem;
};

export function KpiCard({ item }: KpiCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="rounded-[4px] bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                {item.department}
              </span>
              <span className="rounded-[4px] border border-[#4a5565] px-2 py-0.5 text-[10px] text-[#4a5565]">
                {item.status}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-[#666]">
                <TrendingUp className="h-3 w-3 text-primary" />
                Trending
              </span>
            </div>
            <p className="text-[20px] font-medium tracking-[-0.3125px] text-black">
              {item.title}
            </p>
            <p className="mt-1 text-sm text-[#666]">{item.description}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-[#666]">
              <span>Owner: {item.owner}</span>
              <span>•</span>
              <span>Updated: {item.updateCadence}</span>
            </div>
          </div>

          <div className="min-w-[140px] text-right">
            <p className="text-xs font-medium text-black">Progress to Target</p>
            <p className="text-[34px] font-bold leading-8 text-primary">
              {item.progressToTarget}%
            </p>
            <div className="mt-2 h-[6px] w-full rounded-full bg-[#dbe6fb]">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(item.progressToTarget, 100)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-end gap-6">
              <div className="text-left">
                <p className="text-[10px] text-[#666]">Current</p>
                <p className="text-2xl font-bold leading-6 text-primary">
                  {item.currentValue}
                </p>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-[#666]">Target</p>
                <p className="text-2xl font-bold leading-6 text-black">
                  {item.targetValue}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-[8px] bg-[#f3f3f3] p-3">
            <p className="mb-2 text-sm font-medium text-black">6-Month Trend</p>
            <KpiTrendBars values={item.trend} />
          </div>

          <div className="rounded-[12px] bg-[rgba(30,102,247,0.05)] p-3">
            <p className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              AI Summary
            </p>
            <p className="mt-1 text-sm text-[rgba(0,0,0,0.8)]">
              {item.aiSummary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
