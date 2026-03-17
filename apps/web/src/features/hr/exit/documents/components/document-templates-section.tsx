import type { DocumentTemplateItem } from "@/features/hr/exit/documents/types";

import { DocumentTemplateCard } from "./document-template-card";

type DocumentTemplatesSectionProps = {
  items: DocumentTemplateItem[];
};

export function DocumentTemplatesSection({ items }: DocumentTemplatesSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-base font-medium tracking-[-0.176px] text-black">Document Templates</p>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <DocumentTemplateCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
