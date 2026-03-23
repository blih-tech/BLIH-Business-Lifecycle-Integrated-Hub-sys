import { Copy, Eye, Pencil, Trash2 } from "lucide-react";

import type { RelatedFormItem } from "@/features/hr/talent/related-forms/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type FormRowCardProps = {
  item: RelatedFormItem;
};

export function FormRowCard({ item }: FormRowCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none transition-colors hover:bg-[#fcfcfc]">
      <CardContent className="space-y-2.5 p-3.5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-xl leading-6">{item.icon}</p>
              <p className="text-sm font-semibold tracking-[-0.176px] text-black">{item.title}</p>
              <Badge className="h-5 rounded-[6px] bg-primary px-2 text-[10px] font-medium">{item.status}</Badge>
              <Badge variant="outline" className="h-5 rounded-[6px] px-2 text-[10px] font-medium text-black">
                {item.category}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[#666]">{item.description}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666]">
              <p>
                <span className="font-medium">{item.questions}</span> questions
              </p>
              <p>
                <span className="font-medium">{item.sections}</span> sections
              </p>
              <p>
                <span className="font-medium">{item.responses}</span> responses
              </p>
              <p>Modified: {item.modifiedAt}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="outline" size="icon-sm" className="h-8 w-[38px] rounded-[6px] border-border bg-white text-black">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" className="h-8 w-[38px] rounded-[6px] border-border bg-white text-black">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" className="h-8 w-[38px] rounded-[6px] border-border bg-white text-black">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" className="h-8 w-[38px] rounded-[6px] border-border bg-white text-black">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
