import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type TimesheetPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function TimesheetPagination({
  currentPage,
  totalPages,
  onPageChange,
}: TimesheetPaginationProps) {
  return (
    <div className="mt-5 flex items-center justify-center gap-4">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="h-5 w-5 rounded-full p-0 text-foreground hover:bg-muted"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          const active = page === currentPage;

          return (
            <Button
              key={page}
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                'h-4 w-4 rounded-full p-0 text-[12px] leading-4',
                active
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-foreground hover:bg-muted',
              )}
              onClick={() => onPageChange(page)}
              aria-current={active ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="h-5 w-5 rounded-full p-0 text-foreground hover:bg-muted"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
