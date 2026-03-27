import { CheckCircle2, FileText, Mail, NotebookText } from "lucide-react";

import type { ExitResignStatItem } from "@/features/hr/exit/resign/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type ResignStatsCardProps = {
  item: ExitResignStatItem;
};

export function ResignStatsCard({ item }: ResignStatsCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[#666]">{item.label}</p>
            <p className="mt-1 text-[30px] font-semibold leading-8 text-black">{item.value}</p>
          </div>
          <div className="text-primary">{renderIcon(item.icon)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderIcon(icon: ExitResignStatItem["icon"]) {
  if (icon === "pending") {
    return <Mail className="h-4 w-4" />;
  }
  if (icon === "approved") {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (icon === "month") {
    return <NotebookText className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
}
