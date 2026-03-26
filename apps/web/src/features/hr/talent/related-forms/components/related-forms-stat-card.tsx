import { CheckCircle2, ClipboardList, FileText, Files } from "lucide-react";

import type { RelatedFormsStat } from "@/features/hr/talent/related-forms/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type RelatedFormsStatCardProps = {
  item: RelatedFormsStat;
};

export function RelatedFormsStatCard({ item }: RelatedFormsStatCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#666]">{item.label}</p>
            <p className="mt-1 text-[33px] font-semibold leading-8 tracking-[0.3955px] text-black">{item.value}</p>
          </div>
          <div className="text-primary">{renderStatIcon(item.icon)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderStatIcon(icon: RelatedFormsStat["icon"]) {
  if (icon === "check") {
    return <CheckCircle2 className="h-5 w-5" />;
  }
  if (icon === "questions") {
    return <ClipboardList className="h-5 w-5" />;
  }
  if (icon === "responses") {
    return <Files className="h-5 w-5" />;
  }
  return <FileText className="h-5 w-5" />;
}
