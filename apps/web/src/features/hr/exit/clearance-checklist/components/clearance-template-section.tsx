import {
  Award,
  FileText,
  MessageSquareText,
  Package,
  ScrollText,
  Wallet,
} from 'lucide-react';

import type { ChecklistTemplateTask } from '@/features/hr/exit/clearance-checklist/types';
import { Card, CardContent } from '@/shared/components/ui/card';

type ClearanceTemplateSectionProps = {
  items: ChecklistTemplateTask[];
};

export function ClearanceTemplateSection({
  items,
}: ClearanceTemplateSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-primary py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-sm font-medium tracking-[-0.1504px] text-black">
          Exit Clearance Checklist Template
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-[8px] border border-[#e5e5e5] bg-background px-3 py-2.5"
            >
              <div className="mt-0.5 grid h-5 w-5 place-items-center rounded-[6px] bg-[rgba(30,102,247,0.12)] text-primary">
                {renderTemplateIcon(item.icon)}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold leading-5 tracking-[-0.1504px] text-black">
                  {item.order}. {item.title}
                </p>
                <p className="text-xs leading-4 text-[#666]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function renderTemplateIcon(icon: ChecklistTemplateTask['icon']) {
  if (icon === 'message') {
    return <MessageSquareText className="h-3.5 w-3.5" />;
  }

  if (icon === 'package') {
    return <Package className="h-3.5 w-3.5" />;
  }

  if (icon === 'wallet') {
    return <Wallet className="h-3.5 w-3.5" />;
  }

  if (icon === 'certificate') {
    return <ScrollText className="h-3.5 w-3.5" />;
  }

  if (icon === 'award') {
    return <Award className="h-3.5 w-3.5" />;
  }

  return <FileText className="h-3.5 w-3.5" />;
}
