import { AlertCircle, CheckCircle2, FileText } from "lucide-react";

import type { ExitDocumentsStat } from "@/features/hr/exit/documents/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type DocumentsStatsCardProps = {
  item: ExitDocumentsStat;
};

export function DocumentsStatsCard({ item }: DocumentsStatsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[#666]">{item.label}</p>
            <p className="mt-1 text-[33px] font-semibold leading-8 text-black">{item.value}</p>
          </div>
          <div className="text-primary">{renderIcon(item.icon)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderIcon(icon: ExitDocumentsStat["icon"]) {
  if (icon === "cleared") {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (icon === "progress") {
    return <AlertCircle className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
}
