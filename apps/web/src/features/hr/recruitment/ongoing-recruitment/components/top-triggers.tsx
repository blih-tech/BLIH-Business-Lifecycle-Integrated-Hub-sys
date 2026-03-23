import { TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

type TopTriggersProps = {
  onInterviewCount: number;
  shortlistedCount: number;
  waitlistedCount: number;
};

export function TopTriggers({
  onInterviewCount,
  shortlistedCount,
  waitlistedCount,
}: TopTriggersProps) {
  return (
    <TabsList className="h-auto w-full gap-2 rounded-none bg-transparent p-0">
      <TabsTrigger
        value="interview"
        className="h-auto flex-1 rounded-b-none rounded-t-[12px] border border-transparent bg-[#f3f3f3] px-6 py-[9px] text-sm font-medium tracking-[-0.1504px] text-black !shadow-none data-[state=active]:border-[#e5e5e5] data-[state=active]:border-b-transparent data-[state=active]:bg-white data-[state=active]:py-[9px] data-[state=active]:!shadow-none"
      >
        Interviews ({onInterviewCount})
      </TabsTrigger>
      <TabsTrigger
        value="shortlisted"
        className="h-auto flex-1 rounded-b-none rounded-t-[12px] border border-transparent bg-[#f3f3f3] px-6 py-[9px] text-sm font-medium tracking-[-0.1504px] text-black !shadow-none data-[state=active]:border-[#e5e5e5] data-[state=active]:border-b-transparent data-[state=active]:bg-white data-[state=active]:py-[9px] data-[state=active]:!shadow-none"
      >
        Shortlisted ({shortlistedCount})
      </TabsTrigger>
      <TabsTrigger
        value="waitlisted"
        className="h-auto flex-1 rounded-b-none rounded-t-[12px] border border-transparent bg-[#f3f3f3] px-6 py-[9px] text-sm font-medium tracking-[-0.1504px] text-black !shadow-none data-[state=active]:border-[#e5e5e5] data-[state=active]:border-b-transparent data-[state=active]:bg-white data-[state=active]:py-[9px] data-[state=active]:!shadow-none"
      >
        Rejected ({waitlistedCount})
      </TabsTrigger>
    </TabsList>
  );
}
