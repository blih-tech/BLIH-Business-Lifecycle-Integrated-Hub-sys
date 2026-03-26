import type { TopRecipient } from "@/features/hr/workforce/benefits/types";
import { Card, CardContent } from "@/shared/components/ui/card";

type TopRecipientCardProps = {
  item: TopRecipient;
};

export function TopRecipientCard({ item }: TopRecipientCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="flex items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
            {item.initials}
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[-0.2px] text-black">{item.name}</p>
            <p className="text-[11px] text-[#666]">{item.note}</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-black">{item.amount}</p>
      </CardContent>
    </Card>
  );
}
