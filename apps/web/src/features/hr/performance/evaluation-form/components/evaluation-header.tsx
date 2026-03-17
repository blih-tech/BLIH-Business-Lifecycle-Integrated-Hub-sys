import { Card, CardContent } from "@/shared/components/ui/card";

export function EvaluationHeader() {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4">
        <p className="text-xl font-semibold tracking-[-0.3125px] text-black">
          Evaluation Forms &amp; Questionnaires
        </p>
        <p className="mt-1 text-xs text-[#666]">
          Create and manage performance evaluation forms, KPI assessments, and OKR check-ins
        </p>
      </CardContent>
    </Card>
  );
}
