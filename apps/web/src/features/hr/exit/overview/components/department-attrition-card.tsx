import type { DepartmentAttritionItem } from "@/features/hr/exit/overview/types";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

type DepartmentAttritionCardProps = {
  item: DepartmentAttritionItem;
};

export function DepartmentAttritionCard({ item }: DepartmentAttritionCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold tracking-[-0.176px] text-black">{item.name}</p>
            <Badge variant="outline" className="h-5 rounded-[6px] px-2 text-[10px] font-medium text-black">
              {item.employees} employees
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#666]">Attrition Rate</p>
            <p className="text-xl font-semibold text-black">{item.attritionRate}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-[#666]">
          <p>{item.exitsThisYear} exits this year</p>
          <p>{item.remaining} remaining</p>
        </div>
      </CardContent>
    </Card>
  );
}
