import { exitResignRequests, exitResignStats } from "@/features/hr/exit/resign/mock-data";
import { ResignStatsGrid, ResignationLettersSection } from "@/features/hr/exit/resign/components";

export * from "@/features/hr/exit/resign/components";
export * from "@/features/hr/exit/resign/types";

export function ExitResignContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <ResignStatsGrid items={exitResignStats} />
      <ResignationLettersSection items={exitResignRequests} />
    </main>
  );
}
