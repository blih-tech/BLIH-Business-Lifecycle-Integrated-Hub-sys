import { CheckCircle2, Clock3 } from "lucide-react";
import type { OnboardingMember } from "@/features/hr/onboarding/progress/types";
import { CompletionBar } from "@/features/hr/onboarding/progress/components/completion-bar";

type OnboardingCardProps = {
  member: OnboardingMember;
};

export function OnboardingCard({ member }: OnboardingCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-[#f3f3f3] p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_173px]">
        <div>
          <div className="flex items-start gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1e66f7] text-base font-semibold tracking-[-0.3125px] text-white">
              {member.avatarText}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-base font-medium leading-4 tracking-[-0.3125px] text-black">{member.name}</p>
                <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-xs font-semibold uppercase leading-4 text-[#1e66f7]">
                  {member.department}
                </span>
              </div>
              <p className="mt-1 text-sm tracking-[-0.1504px] text-[#666]">{member.role}</p>
            </div>
          </div>

          <div className="my-6 h-px w-full bg-[#d6d6d6]" />

          <div className="flex flex-wrap gap-3">
            {member.checklist.map((item) => (
              <div
                key={item.id}
                className={[
                  "inline-flex items-center gap-1 rounded-[8px] px-2 py-1.5 text-sm tracking-[-0.1504px]",
                  item.done
                    ? "bg-[rgba(30,102,247,0.1)] text-black"
                    : "bg-[#e7e7e7] text-[#666]",
                ].join(" ")}
              >
                {item.done ? <CheckCircle2 size={16} className="text-[#1e66f7]" /> : <Clock3 size={16} className="text-[#666]" />}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <CompletionBar
          value={member.completionPercent}
          completedTasks={member.completedTasks}
          totalTasks={member.totalTasks}
        />
      </div>
    </article>
  );
}
