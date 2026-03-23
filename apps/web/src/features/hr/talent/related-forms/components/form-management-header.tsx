import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

export function FormManagementHeader() {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5">
          <p className="text-base font-semibold tracking-[-0.176px] text-black">
            Form Management Center
          </p>
          <p className="text-xs text-[#666]">
            Create and manage talent management forms including satisfaction
            surveys, grievances, and assessments
          </p>
        </div>
        <Button size="sm" className="h-8 rounded-[6px] px-3 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Create New Form
        </Button>
      </CardContent>
    </Card>
  );
}
