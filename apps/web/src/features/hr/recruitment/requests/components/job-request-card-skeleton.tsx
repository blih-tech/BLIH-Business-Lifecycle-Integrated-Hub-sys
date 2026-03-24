import { Skeleton } from '@/shared/components/ui/skeleton';

export function JobRequestCardSkeleton() {
  return (
    <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-[25px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3 rounded-[6px]" />
          <Skeleton className="h-4 w-1/3 rounded-[4px]" />
        </div>
        <Skeleton className="h-[22px] w-[64px] rounded-[6px]" />
      </div>

      <div className="mt-[24px] flex items-end justify-between gap-4">
        <div className="flex flex-1 flex-col gap-[6px]">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center gap-[8px]">
          <Skeleton className="h-[32px] w-[88px] rounded-[6px]" />
          <Skeleton className="h-[32px] w-[77px] rounded-[6px]" />
        </div>
      </div>
    </div>
  );
}
