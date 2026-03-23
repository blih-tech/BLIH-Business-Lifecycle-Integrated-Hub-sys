import type { ExitResignRequestItem } from '@/features/hr/exit/resign/types';

import { ResignationRequestCard } from './resignation-request-card';

type ResignationLettersSectionProps = {
  items: ExitResignRequestItem[];
};

export function ResignationLettersSection({
  items,
}: ResignationLettersSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">
        Resignation Letters Received
      </p>
      <div className="space-y-3">
        {items.map((item) => (
          <ResignationRequestCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
