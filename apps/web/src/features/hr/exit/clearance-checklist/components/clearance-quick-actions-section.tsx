import { Bell, Download, RefreshCw, Sparkles } from 'lucide-react';

import type { ClearanceQuickAction } from '@/features/hr/exit/clearance-checklist/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

type ClearanceQuickActionsSectionProps = {
  items: ClearanceQuickAction[];
};

export function ClearanceQuickActionsSection({
  items,
}: ClearanceQuickActionsSectionProps) {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-base tracking-[-0.3125px] text-black">
          Quick Actions
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="h-[40px] rounded-[6px] border-border bg-white text-xs font-medium text-black hover:bg-white"
            >
              {renderQuickActionIcon(item.icon)}
              {item.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function renderQuickActionIcon(icon: ClearanceQuickAction['icon']) {
  if (icon === 'download') {
    return <Download className="h-3.5 w-3.5 text-primary" />;
  }

  if (icon === 'bell') {
    return <Bell className="h-3.5 w-3.5 text-primary" />;
  }

  if (icon === 'chart') {
    return <Sparkles className="h-3.5 w-3.5 text-primary" />;
  }

  return <RefreshCw className="h-3.5 w-3.5 text-primary" />;
}
