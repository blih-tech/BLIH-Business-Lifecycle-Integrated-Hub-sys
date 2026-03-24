import { Download, Upload } from 'lucide-react';

import type { DocumentTemplateItem } from '@/features/hr/exit/documents/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

type DocumentTemplateCardProps = {
  item: DocumentTemplateItem;
};

export function DocumentTemplateCard({ item }: DocumentTemplateCardProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="text-base font-semibold tracking-[-0.3125px] text-black">
            {item.title}
          </p>
          <p className="text-sm text-[#666]">{item.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 flex-1 rounded-[6px] border-border bg-white text-xs text-black"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-[38px] rounded-[6px] border-border bg-white text-black"
          >
            <Upload className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
