import type { PreviousTraining } from "@/features/hr/talent/training-skills/types";

import { PreviousTrainingCard } from "./previous-training-card";

type PreviousTrainingsSectionProps = {
  items: PreviousTraining[];
};

export function PreviousTrainingsSection({ items }: PreviousTrainingsSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">Previous Trainings &amp; Certifications</p>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <PreviousTrainingCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
