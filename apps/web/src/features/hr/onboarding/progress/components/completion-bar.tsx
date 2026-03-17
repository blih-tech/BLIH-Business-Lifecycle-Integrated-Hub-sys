type CompletionBarProps = {
  value: number;
  completedTasks: number;
  totalTasks: number;
};

export function CompletionBar({ value, completedTasks, totalTasks }: CompletionBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <section className="relative flex h-[216px] w-full max-w-[173px] flex-col justify-between rounded-[8px] border border-[#1e66f7] bg-[rgba(30,102,247,0.1)] p-2">
      <div className="flex items-start justify-between">
        <p className="text-base font-semibold tracking-[-0.3125px] text-black">Completion Bar</p>
        <span className="text-sm text-[#f0c419]">✦</span>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative h-[89px] w-[89px]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 89 89">
            <circle cx="44.5" cy="44.5" r={radius} fill="none" stroke="#c7d7fb" strokeWidth="6" />
            <circle
              cx="44.5"
              cy="44.5"
              r={radius}
              fill="none"
              stroke="#1e66f7"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <p className="text-2xl font-bold leading-none tracking-[0.3955px] text-[#1e66f7]">{clamped}%</p>
          </div>
        </div>
      </div>

      <p className="text-sm tracking-[-0.1504px] text-[#666]">Overall Progress</p>
      <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
        {completedTasks}/{totalTasks} tasks
      </p>
    </section>
  );
}
