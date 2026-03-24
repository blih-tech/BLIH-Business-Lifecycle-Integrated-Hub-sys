import type { DisciplineStat } from '@/features/hr/talent/discipline/types';
import { cn } from '@/shared/lib/utils';

type DisciplineStatCardProps = {
  item: DisciplineStat;
};

export function DisciplineStatCard({ item }: DisciplineStatCardProps) {
  return (
    <div className="rounded-[8px] bg-[#f3f3f3] px-4 py-3 text-center">
      <p
        className={cn(
          'text-[30px] font-bold leading-8 tracking-[0.3955px]',
          item.tone === 'danger' ? 'text-[#e7000b]' : 'text-primary',
        )}
      >
        {item.value}
      </p>
      <p className="mt-1 text-xs text-[#666]">{item.label}</p>
    </div>
  );
}
