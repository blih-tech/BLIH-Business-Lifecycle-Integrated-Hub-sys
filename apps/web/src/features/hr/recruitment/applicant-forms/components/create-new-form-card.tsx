import { Plus } from "lucide-react";

export function CreateNewFormCard() {
  return (
    <article className="flex h-[240px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-primary bg-white text-center transition-colors duration-200 hover:bg-[rgba(30,102,247,0.04)]">
      <span className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-primary text-white">
        <Plus className="h-5 w-5" />
      </span>
      <p className="mt-3 text-base font-medium tracking-[-0.3125px] text-black">Create New Form</p>
      <p className="mt-2 text-xs text-[#666]">Build a custom application form from scratch</p>
    </article>
  );
}
