import { Card, CardContent } from '@/shared/components/ui/card';

export function BudgetManagementCard() {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="space-y-1.5 p-4">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">
          Budget Management
        </p>
        <p className="text-xs text-[#666]">
          Create and manage different budget types for your organization
        </p>
      </CardContent>
    </Card>
  );
}
