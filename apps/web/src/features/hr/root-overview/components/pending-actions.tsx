import type { RootOverviewPendingActionItem } from "@/features/hr/root-overview/types";

type PendingActionsProps = {
  items: RootOverviewPendingActionItem[];
};

export function PendingActions({ items }: PendingActionsProps) {
  return (
    <section className="ui-surface p-4 md:p-5">
      <h2 className="ui-section-title text-foreground">Pending Actions</h2>
      <div className="mt-3 space-y-2.5">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-lg bg-muted px-3.5 py-2.5"
          >
            <div>
              <p className="ui-section-title text-foreground">{item.category}</p>
              <p className="ui-body mt-1 text-muted-foreground">{item.description}</p>
            </div>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
              {item.count}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
