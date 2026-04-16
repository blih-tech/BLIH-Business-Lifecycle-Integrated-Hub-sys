'use client';

import { useEffect, useState } from 'react';
import { getProbationKpis } from '@/features/hr/onboarding/probation/api/probation-kpi.api';
import type { ProbationKpiResponseDto } from '@/types';

type KpiManagementProps = {
  probationId?: string;
};

export function KpiManagement({
  probationId,
}: KpiManagementProps): React.ReactElement {
  const [kpis, setKpis] = useState<ProbationKpiResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const result = await getProbationKpis(probationId);
        if (mounted) {
          setKpis(result);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [probationId]);

  if (loading)
    return <p className="text-sm text-muted-foreground">Loading KPIs...</p>;

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">KPI Management</h3>
      <p className="text-sm text-muted-foreground">KPIs: {kpis.length}</p>
    </div>
  );
}
