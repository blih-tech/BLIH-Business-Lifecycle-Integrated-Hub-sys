import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';

import type { EvaluationFormItem } from '@/features/hr/performance/evaluation-form/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

type EvaluationFormCardProps = {
  form: EvaluationFormItem;
};

export function EvaluationFormCard({ form }: EvaluationFormCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <p className="text-base font-semibold tracking-[-0.3125px] text-black">
                {form.title}
              </p>
              <span
                className={cn(
                  'inline-flex h-[22px] items-center rounded-[6px] px-2 text-[10px] font-medium',
                  form.status === 'active'
                    ? 'bg-primary text-white'
                    : 'bg-[#4a5565] text-white',
                )}
              >
                {form.status}
              </span>
              {form.tags.map((tag) => (
                <span
                  key={`${form.id}-${tag}`}
                  className="inline-flex h-[22px] items-center rounded-[6px] border border-border px-2 text-[10px] font-medium text-black"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm text-[#666] md:grid-cols-2 xl:grid-cols-4 xl:gap-4">
              <p>
                <span className="font-medium">{form.questions}</span> questions
              </p>
              <p>
                <span className="font-medium">{form.sections}</span> sections
              </p>
              <p>
                Used by{' '}
                <span className="font-medium">{form.usedByEmployees}</span>{' '}
                employees
              </p>
              <p>Modified: {form.modifiedOn}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <IconActionButton icon={Eye} label="View" />
            <IconActionButton icon={Pencil} label="Edit" />
            <IconActionButton icon={Copy} label="Copy" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-10 rounded-[6px] border-border bg-white text-black hover:bg-muted"
              aria-label="Delete"
            >
              <Trash2 className="h-[14px] w-[14px]" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IconActionButton({
  icon: Icon,
  label,
}: {
  icon: typeof Eye;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-8 w-8 rounded-[6px] border-border bg-white text-black hover:bg-muted"
      aria-label={label}
    >
      <Icon className="h-[14px] w-[14px]" />
    </Button>
  );
}
