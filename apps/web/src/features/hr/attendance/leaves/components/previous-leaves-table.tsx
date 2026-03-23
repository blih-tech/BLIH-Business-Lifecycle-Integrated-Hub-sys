'use client';

import { ChevronLeft, ChevronRight, ListFilter, Search } from 'lucide-react';

import type { PreviousLeaveRow } from '@/features/hr/attendance/leaves/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';

type PreviousLeavesTableProps = {
  rows: PreviousLeaveRow[];
  totalRows: number;
  currentPage: number;
  totalPages: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
};

export function PreviousLeavesTable({
  rows,
  totalRows,
  currentPage,
  totalPages,
  selectedId,
  onSelect,
  onPageChange,
  searchTerm,
  onSearchTermChange,
}: PreviousLeavesTableProps) {
  return (
    <section className="rounded-[12px] bg-card p-0">
      <div className="space-y-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search previous leave requests..."
            className="h-9 rounded-[6px] border-input bg-muted pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-[6px] border-input bg-background text-muted-foreground"
          >
            <ListFilter className="h-3.5 w-3.5" />
          </Button>

          <Select defaultValue="Marketing">
            <SelectTrigger
              size="sm"
              className="flex-1 rounded-[6px] border-input bg-background text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="Leave Type">
            <SelectTrigger
              size="sm"
              className="flex-1 rounded-[6px] border-input bg-background text-sm text-muted-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Leave Type">Leave Type</SelectItem>
              <SelectItem value="Sick">Sick</SelectItem>
              <SelectItem value="Annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <p>{totalRows} employees found</p>
          <p>
            Sort by:
            <span className="ml-1 border-b border-foreground pb-0.5 font-medium text-foreground">
              Name
            </span>
          </p>
        </div>

        <div className="space-y-1">
          {rows.map((row) => {
            const selected = row.id === selectedId;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(row.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-left transition-colors',
                  selected
                    ? 'border border-primary bg-background'
                    : 'border border-transparent bg-muted/60 hover:bg-muted',
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#404040] text-[10px] font-semibold text-white">
                    {row.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-4 tracking-[-0.1504px] text-foreground">
                      {row.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.role}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-medium text-foreground">
                  {row.department}
                </p>
                <span className="rounded-[4px] border border-primary px-2 py-0.5 text-[10px] font-medium text-primary">
                  {row.leaveType}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
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
    </section>
  );
}
