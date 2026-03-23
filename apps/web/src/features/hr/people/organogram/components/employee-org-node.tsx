import type { OrgPersonNode } from '@/features/hr/people/organogram/types';
import { cn } from '@/shared/lib/utils';

type EmployeeOrgNodeProps = {
  node: OrgPersonNode;
};

export function EmployeeOrgNode({ node }: EmployeeOrgNodeProps) {
  return (
    <article
      className={cn(
        'absolute h-[48px] w-[108px] rounded-[6px] border border-[#1e66f7] bg-white px-1.5 py-1',
        'shadow-[0px_2px_4px_rgba(30,102,247,0.12)]',
      )}
      style={{ left: node.x, top: node.y }}
    >
      <div className="flex items-start gap-1.5">
        <div className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#1e66f7] text-[8px] font-semibold text-white">
          {node.avatarInitials ?? 'HR'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[9px] font-semibold leading-[1.2] text-[#1a1a1a]">
            {node.name}
          </p>
          <p className="mt-0.5 truncate text-[8px] leading-[1.2] text-[#666]">
            {node.role}
          </p>
        </div>
      </div>
    </article>
  );
}
