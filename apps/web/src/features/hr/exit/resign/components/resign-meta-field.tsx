import type { ExitResignMetaField } from "@/features/hr/exit/resign/types";

type ResignMetaFieldProps = {
  field: ExitResignMetaField;
};

export function ResignMetaField({ field }: ResignMetaFieldProps) {
  return (
    <div className="h-[60px] rounded-[8px] bg-[#f3f3f3] px-3 pt-3">
      <p className="text-xs leading-4 text-[#666]">{field.label}</p>
      <p className="text-sm font-semibold leading-5 tracking-[-0.1504px] text-black">{field.value}</p>
    </div>
  );
}
