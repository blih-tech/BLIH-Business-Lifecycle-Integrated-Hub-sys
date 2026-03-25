import { Card, CardContent } from "@/shared/components/ui/card";

export function OffboardingSummaryCard() {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-4 p-4">
        <p className="text-base font-medium tracking-[-0.176px] text-black">Offboarding Summary</p>
        <div className="space-y-3">
          <SummaryRow label="Pending Exit Interviews" value="3" />
          <SummaryRow label="Pending Clearance Checklists" value="12" />
          <SummaryRow label="Pending Documents" value="5" />
          <SummaryRow label="Related Forms Pending" value="4" />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-border bg-[#f8f8f8] px-3 py-2">
      <p className="text-xs text-[#666]">{label}</p>
      <p className="text-sm font-semibold text-black">{value}</p>
    </div>
  );
}
