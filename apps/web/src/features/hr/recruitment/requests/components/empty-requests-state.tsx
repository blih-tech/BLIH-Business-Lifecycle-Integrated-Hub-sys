type EmptyRequestsStateProps = {
  message: string;
};

export function EmptyRequestsState({ message }: EmptyRequestsStateProps) {
  return (
    <section className="ui-surface flex min-h-[180px] items-center justify-center bg-background p-4 md:min-h-[220px]">
      <p className="ui-body text-muted-foreground">{message}</p>
    </section>
  );
}
