import type { CultureInitiative } from "@/features/hr/talent/culture/types";

import { CultureInitiativeCard } from "./culture-initiative-card";

type CultureInitiativesGridProps = {
  items: CultureInitiative[];
};

export function CultureInitiativesGrid({ items }: CultureInitiativesGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <CultureInitiativeCard key={item.id} item={item} />
      ))}
    </section>
  );
}
