import { BadgeCheck, ExternalLink, Shield, Users, Zap } from "lucide-react";

import type { CulturePolicy } from "@/features/hr/talent/culture/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type PolicyCardProps = {
  item: CulturePolicy;
};

export function PolicyCard({ item }: PolicyCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-3">
        <div className="flex items-start gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#dbe6fb]">
            <PolicyIcon icon={item.icon} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-[-0.3125px] text-black">{item.title}</p>
            <p className="text-sm text-[#666]">{item.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2">
          <p className="text-xs text-[#666]">Updated: {item.updatedAt}</p>
          <Button size="sm" variant="outline" className="h-7 rounded-[6px] border-border bg-white text-xs text-black">
            Read Policy
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PolicyIcon({ icon }: { icon: CulturePolicy["icon"] }) {
  if (icon === "shield") return <Shield className="h-4 w-4 text-primary" />;
  if (icon === "badge") return <BadgeCheck className="h-4 w-4 text-primary" />;
  if (icon === "users") return <Users className="h-4 w-4 text-primary" />;
  return <Zap className="h-4 w-4 text-primary" />;
}
