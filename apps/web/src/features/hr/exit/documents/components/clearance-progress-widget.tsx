type ClearanceProgressWidgetProps = {
  progressText: string;
  progressTasks: string;
};

export function ClearanceProgressWidget({
  progressText,
  progressTasks,
}: ClearanceProgressWidgetProps) {
  const numericProgress = Number.parseFloat(progressText.replace('%', ''));
  const clampedProgress = Number.isFinite(numericProgress)
    ? Math.max(0, Math.min(numericProgress, 100))
    : 100;
  const visualProgress = clampedProgress === 100 ? 98 : clampedProgress;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (visualProgress / 100) * circumference;

  return (
    <div className="relative h-full w-[124px] rounded-[8px] border border-primary bg-[rgba(30,102,247,0.1)] p-2">
      <p className="text-base font-semibold tracking-[-0.3125px] text-black">
        Completion Bar
      </p>
      <div className="mt-1 flex justify-center">
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
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 44.5 44.5)"
            />
          </svg>
          <span className="absolute text-[20px] font-bold leading-none tracking-[0.3955px] text-primary">
            {progressText}
          </span>
        </div>
      </div>
      <div className="-mt-0.5">
        <p className="text-sm text-[#666]">Overall Progress</p>
        <p className="text-sm font-semibold text-black">{progressTasks}</p>
      </div>
      <span className="absolute right-[8px] top-[8px] text-[14px] leading-none text-[#ffe345]">
        ✦
      </span>
    </div>
  );
}
