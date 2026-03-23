import { Sparkles } from 'lucide-react';

export function CreateWithAICard() {
  return (
    <article className="flex h-[240px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-[#e5e5e5] bg-white text-center transition-colors duration-200 hover:bg-[#fafafa]">
      <span className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-black text-white">
        <Sparkles className="h-5 w-5" />
      </span>
      <p className="mt-3 text-base font-medium tracking-[-0.3125px] text-black">
        Create with AI
      </p>
      <p className="mt-2 text-xs text-[#666]">
        Generate a form using AI based on job requirements
      </p>
    </article>
  );
}
