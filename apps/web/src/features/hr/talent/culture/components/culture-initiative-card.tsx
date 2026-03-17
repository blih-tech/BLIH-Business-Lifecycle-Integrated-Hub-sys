import { CalendarDays, ExternalLink, Users } from "lucide-react";

import type { CultureInitiative } from "@/features/hr/talent/culture/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type CultureInitiativeCardProps = {
  item: CultureInitiative;
};

export function CultureInitiativeCard({ item }: CultureInitiativeCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-3">
        <div>
          <p className="text-lg font-medium tracking-[-0.3125px] text-black">{item.title}</p>
          <span className="mt-1 inline-flex rounded-[6px] bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
            {item.status}
          </span>
        </div>

        <p className="text-xs text-[#666]">{item.description}</p>

        <div className="space-y-1 rounded-[8px] bg-[#f3f3f3] p-2.5 text-xs text-[#666]">
          <p className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-black">Timeline:</span> {item.timeline}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-black">Assigned To:</span> {item.assignedTo}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-black">Participants ({item.participantsCount})</p>
            <Button size="sm" variant="outline" className="h-6 rounded-[6px] border-border bg-white px-2 text-[11px] text-black">
              Full Details
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            {item.participantInitials.map((initial) => (
              <span
                key={`${item.id}-${initial}`}
                className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[9px] font-semibold text-white"
              >
                {initial}
              </span>
            ))}
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#4a5565] text-[9px] font-semibold text-white">
              +{item.extraParticipants}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
