import type { RelatedFormType } from "@/features/hr/talent/related-forms/types";
import { Card, CardContent } from "@/shared/components/ui/card";

import { FormTypeCard } from "./form-type-card";

type FormTypesSectionProps = {
  items: RelatedFormType[];
};

export function FormTypesSection({ items }: FormTypesSectionProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium text-black">Available Form Types</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <FormTypeCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
