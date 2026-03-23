import { Plus } from 'lucide-react';

type CreateProfileCardProps = {
  title: string;
  description: string;
  onClick?: () => void;
};

export function CreateProfileCard({
  title,
  description,
  onClick,
}: CreateProfileCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-[240px] w-full cursor-pointer items-center justify-center rounded-[12px] border-2 border-dashed border-primary/80 bg-white p-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-[#f8fbff] hover:shadow-[0_8px_24px_rgba(30,102,247,0.12)]"
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[8px] bg-primary text-white transition-all duration-200 group-hover:scale-[1.03] group-hover:bg-[#1659df]">
          <Plus className="h-8 w-8" />
        </div>
        <h2 className="text-base font-semibold tracking-[-0.3125px] text-black transition-colors group-hover:text-[#0f3fa8]">
          {title}
        </h2>
        <p className="text-sm tracking-[-0.1504px] text-[#666] transition-colors group-hover:text-[#4b5563]">
          {description}
        </p>
      </div>
    </button>
  );
}
