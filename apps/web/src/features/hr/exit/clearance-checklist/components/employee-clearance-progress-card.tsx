import { AlertCircle, CheckCircle2, Circle, Download } from 'lucide-react';

import type {
  EmployeeClearanceProgressItem,
  EmployeeClearanceTask,
} from '@/features/hr/exit/clearance-checklist/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

type EmployeeClearanceProgressCardProps = {
  item: EmployeeClearanceProgressItem;
};

export function EmployeeClearanceProgressCard({
  item,
}: EmployeeClearanceProgressCardProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
              {item.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
                  {item.name}
                </p>
                <span className="inline-flex h-4 items-center rounded-[4px] bg-[#f5f5f5] px-1.5 text-[10px] text-black">
                  {item.department}
                </span>
                <span className={getStatusBadgeClassName(item.status)}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-[#666]">{item.role}</p>
            </div>
          </div>
          <p className="text-[11px] text-[#666]">
            Last Working Day: {item.lastWorkingDay}
          </p>
        </div>

        <div className="grid gap-2 lg:grid-cols-[1fr_132px]">
          <div className="grid gap-2 md:grid-cols-2">
            {item.tasks.map((task) => (
              <TaskStatusCard key={task.id} task={task} />
            ))}
          </div>
          <CompletionBarWidget
            progressPercent={item.progressPercent}
            progressTasks={item.progressTasks}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 min-w-[132px] rounded-[6px] border-border bg-white text-xs text-black hover:bg-white"
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="h-8 min-w-[132px] rounded-[6px] px-3 text-xs"
          >
            Generate Clearance Certificate
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskStatusCard({ task }: { task: EmployeeClearanceTask }) {
  return (
    <div className={getTaskCardClassName(task.status)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold leading-4 tracking-[-0.08px] text-black">
            {renderTaskStatusIcon(task.status)}
            {task.title}
          </p>
          {task.meta ? (
            <p className="mt-0.5 text-[10px] leading-4 text-[#666]">
              {task.meta}
            </p>
          ) : null}
        </div>
        {task.actionLabel ? (
          <Button size="xs" className="h-5 rounded-[4px] px-1.5 text-[10px]">
            {task.actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function CompletionBarWidget({
  progressPercent,
  progressTasks,
}: {
  progressPercent: number;
  progressTasks: string;
}) {
  const clampedProgress = Math.max(0, Math.min(progressPercent, 100));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="flex h-full flex-col justify-between rounded-[8px] border border-primary bg-[rgba(30,102,247,0.1)] p-2">
      <p className="text-base font-semibold tracking-[-0.3125px] text-black">
        Completion Bar
      </p>
      <div className="flex justify-center py-1">
        <div className="relative grid h-[89px] w-[89px] place-items-center">
          <svg viewBox="0 0 89 89" className="h-[89px] w-[89px]">
            <circle
              cx="44.5"
              cy="44.5"
              r={radius}
              fill="none"
              stroke="rgba(30,102,247,0.24)"
              strokeWidth="6"
            />
            <circle
              cx="44.5"
              cy="44.5"
              r={radius}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="6"
              strokeLinecap={clampedProgress >= 100 ? 'butt' : 'round'}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 44.5 44.5)"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[24px] font-bold leading-none tracking-[0.3955px] text-primary">
              {clampedProgress}%
            </span>
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm text-[#666]">Overall Progress</p>
        <p className="text-sm font-semibold text-black">{progressTasks}</p>
      </div>
    </div>
  );
}

function getStatusBadgeClassName(
  status: EmployeeClearanceProgressItem['status'],
) {
  if (status === 'completed') {
    return 'inline-flex h-4 items-center rounded-[4px] bg-[#16a34a] px-1.5 text-[10px] font-semibold lowercase text-white';
  }

  return 'inline-flex h-4 items-center rounded-[4px] bg-[#d97706] px-1.5 text-[10px] font-semibold lowercase text-white';
}

function getTaskCardClassName(status: EmployeeClearanceTask['status']) {
  if (status === 'completed') {
    return 'rounded-[6px] border border-[#86efac] bg-[#f0fdf4] p-2';
  }

  if (status === 'in-progress') {
    return 'rounded-[6px] border border-[#fde68a] bg-[#fefce8] p-2';
  }

  return 'rounded-[6px] border border-[#e5e5e5] bg-background p-2';
}

function renderTaskStatusIcon(status: EmployeeClearanceTask['status']) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />;
  }

  if (status === 'in-progress') {
    return <AlertCircle className="h-3.5 w-3.5 text-[#ca8a04]" />;
  }

  return <Circle className="h-3.5 w-3.5 text-[#a3a3a3]" />;
}
