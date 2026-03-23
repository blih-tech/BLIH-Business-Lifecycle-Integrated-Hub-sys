import { Card, CardContent } from '@/shared/components/ui/card';

type ActiveInitiativesHeaderProps = {
  totalPrograms: number;
};

export function ActiveInitiativesHeader({
  totalPrograms,
}: ActiveInitiativesHeaderProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="flex items-center justify-between p-3">
        <p className="text-base font-medium tracking-[-0.176px] text-black">
          Active Culture Initiatives
        </p>
        <span className="rounded-[6px] bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
          {totalPrograms} Programs
        </span>
      </CardContent>
    </Card>
  );
}
