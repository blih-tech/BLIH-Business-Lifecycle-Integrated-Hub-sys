import { Clock3, FileText, Mail } from "lucide-react";

import { ContractCard } from "@/features/hr/onboarding/contract/components";
import { contractSummaryStats, employmentContracts } from "@/features/hr/onboarding/contract/mock-data";
import { ProgressStatCard } from "@/features/hr/onboarding/progress/components";

const ICONS = {
  file: <FileText className="h-4 w-4" />,
  mail: <Mail className="h-4 w-4" />,
  clock: <Clock3 className="h-4 w-4" />,
} as const;

export function OnboardingContractContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-5 md:px-5 md:py-6">
      <section className="grid gap-4 md:grid-cols-3">
        {contractSummaryStats.map((stat) => (
          <ProgressStatCard key={stat.id} stat={stat} icon={ICONS[stat.icon]} />
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-[-0.3125px] text-black">Employment Contracts</h2>
        <p className="mt-1 text-sm tracking-[-0.1504px] text-[#666]">Details of signed employment contracts and offers.</p>

        <div className="mt-5 space-y-3">
          {employmentContracts.map((contract, index) => (
            <ContractCard key={contract.id} contract={contract} defaultExpanded={index === 0} />
          ))}
        </div>
      </section>
    </main>
  );
}
