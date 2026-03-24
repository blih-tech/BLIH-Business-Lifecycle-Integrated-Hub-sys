import type { RelatedFormType } from '@/features/hr/talent/related-forms/types';
import { Badge } from '@/shared/components/ui/badge';

type FormTypeCardProps = {
  item: RelatedFormType;
};

export function FormTypeCard({ item }: FormTypeCardProps) {
  return (
    <div className="rounded-[10px] border border-border bg-white p-4 text-center">
      <p className="text-xl leading-6">{item.icon}</p>
      <p className="mt-2 text-xs font-medium text-black">{item.label}</p>
      <Badge
        variant="outline"
        className="mt-2 h-5 rounded-[6px] px-2 text-[10px] font-medium text-[#666]"
      >
        {item.formsCount} forms
      </Badge>
    </div>
  );
}
