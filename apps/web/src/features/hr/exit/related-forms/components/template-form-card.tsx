import { Download, FileText, Pencil, Trash2 } from "lucide-react";

import type { ExitTemplateFormItem } from "@/features/hr/exit/related-forms/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type TemplateFormCardProps = {
  item: ExitTemplateFormItem;
};

export function TemplateFormCard({ item }: TemplateFormCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-0 bg-white py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[8px] bg-[rgba(30,102,247,0.1)]">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[18px] font-semibold leading-7 tracking-[-0.4395px] text-black">{item.title}</p>
                <span className="inline-flex h-[22px] items-center rounded-[6px] bg-primary px-[9px] text-xs font-medium leading-4 text-white">
                  {item.category}
                </span>
                <span className="inline-flex h-[22px] items-center rounded-[6px] border border-[#e5e5e5] px-[9px] text-xs font-medium leading-4 text-black">
                  {item.version}
                </span>
              </div>
              <p className="text-sm leading-5 tracking-[-0.1504px] text-[#666]">{item.description}</p>
              <p className="text-xs leading-4 text-[#666]">
                Updated: {item.updatedAt}
                <span className="mx-4">•</span>
                Used {item.usedCount} times
              </p>
            </div>
          </div>
          {item.actions.includes("edit") ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-[10px] text-sm text-black hover:bg-white"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </div>

        <div className="rounded-[8px] bg-[#f3f3f3] p-4">
          <p className="mb-2 text-sm font-semibold leading-5 tracking-[-0.1504px] text-black">{item.previewTitle}</p>
          <div className="rounded-[4px] border border-[#e5e5e5] bg-white px-[17px] py-[17px]">
            <p className="whitespace-pre-line text-sm leading-5 tracking-[-0.1504px] text-[rgba(0,0,0,0.7)]">{item.previewText}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {item.actions.map((action) => (
            <ActionButton key={action} action={action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({ action }: { action: ExitTemplateFormItem["actions"][number] }) {
  if (action === "download") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-[8px] text-sm text-black hover:bg-white"
      >
        <Download className="h-4 w-4" />
        Download
      </Button>
    );
  }

  if (action === "edit") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-[10px] text-sm text-black hover:bg-white"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-[10px] text-sm text-[#e7000b] hover:bg-white hover:text-[#e7000b]"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}
