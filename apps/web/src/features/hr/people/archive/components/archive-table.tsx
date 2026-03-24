'use client';

import { ChevronLeft, ChevronRight, ListFilter, Search } from 'lucide-react';

import type { ArchiveEmployee } from '@/features/hr/people/archive/types';
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

type ArchiveTableProps = {
  employees: ArchiveEmployee[];
  totalEmployees: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
};

export function ArchiveTable({
  employees,
  totalEmployees,
  currentPage,
  totalPages,
  onPageChange,
  selectedEmployeeId,
  onSelectEmployee,
  searchTerm,
  onSearchTermChange,
}: ArchiveTableProps) {
  return (
    <section className="rounded-[12px] bg-card p-0">
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search archived employees..."
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
        </div>

        <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
          <p>{totalEmployees} employees found</p>
          <p>
            Sort by:{' '}
            <span className="ml-5 border-b border-foreground pb-1 font-medium text-foreground">
              Name
            </span>
          </p>
        </div>

        <div className="space-y-1">
          {employees.map((employee) => {
            const selected = employee.id === selectedEmployeeId;
            return (
              <button
                key={employee.id}
                type="button"
                onClick={() => onSelectEmployee(employee.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-[6px] px-4 py-2 text-left transition-colors',
                  selected
                    ? 'border border-primary bg-background'
                    : 'border border-transparent bg-muted/60 hover:bg-muted',
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#404040] text-sm font-semibold text-white">
                    {employee.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-4 tracking-[-0.1504px] text-foreground">
                      {employee.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-foreground">
                  {employee.department}
                </p>
                <div className="w-[77px] text-xs leading-4">
                  <p className="text-muted-foreground">Exited at:</p>
                  <p className="text-foreground">{employee.exitedAt}</p>
                </div>
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
