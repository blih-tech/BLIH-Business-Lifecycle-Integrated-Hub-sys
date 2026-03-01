import type { ReactNode } from "react";

type FormSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSectionCard({ title, description, children }: FormSectionCardProps) {
  return (
    <section className="rounded-[10px] border border-[#ececec] bg-[#fafafa] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold tracking-[-0.2px] text-black">{title}</h3>
        {description ? <p className="text-xs text-[#666]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
