import type { RelatedFormItem } from "@/features/hr/talent/related-forms/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { FormRowCard } from "./form-row-card";

type AllFormsSectionProps = {
  items: RelatedFormItem[];
};

export function AllFormsSection({ items }: AllFormsSectionProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-2.5 p-3.5">
        <p className="text-sm font-medium text-black">All Forms</p>
        <div className="space-y-2">
          {items.map((item) => (
            <FormRowCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
