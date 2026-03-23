import { Button } from '@/shared/components/ui/button';

type RequestsErrorStateProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
};

export function RequestsErrorState({
  title = 'Unable to load requests',
  message = 'There was a problem fetching job requests. Please try again.',
  onRetry,
}: RequestsErrorStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}
