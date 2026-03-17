'use client';

import { ChevronLeft, ChevronRight, ListFilter, Search } from 'lucide-react';

import type { DirectoryEmployee } from '@/features/hr/people/directory/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';

type EmployeeTableProps = {
  employees: DirectoryEmployee[];
  totalEmployees: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
};

export function EmployeeTable({
  employees,
  totalEmployees,
  currentPage,
  totalPages,
  onPageChange,
  selectedEmployeeId,
  onSelectEmployee,
  searchTerm,
  onSearchTermChange,
}: EmployeeTableProps) {
  return (
    <section className="rounded-[12px] bg-card p-3">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search employees..."
            className="h-9 border-input bg-background pl-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
              className="min-w-[112px] rounded-[6px] border-input bg-background text-sm font-medium text-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="Location">
            <SelectTrigger
              size="sm"
              className="min-w-[112px] rounded-[6px] border-input bg-background text-sm text-muted-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Location">Location</SelectItem>
              <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
              <SelectItem value="Adama">Adama</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="Job Type">
            <SelectTrigger
              size="sm"
              className="min-w-[112px] rounded-[6px] border-input bg-background text-sm text-muted-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Job Type">Job Type</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="Performance">
            <SelectTrigger
              size="sm"
              className="min-w-[112px] rounded-[6px] border-input bg-background text-sm text-muted-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Performance">Performance</SelectItem>
              <SelectItem value="90+">90+</SelectItem>
              <SelectItem value="80-89">80-89</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <p>{totalEmployees} employees found</p>
          <p>
            Sort by:{' '}
            <span className="ml-1 font-medium text-foreground">Name</span>
          </p>
        </div>
      </div>

      <div className="mt-2">
        <Table className="border-separate [border-spacing:0_4px]">
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="h-9 text-[10px] uppercase tracking-wide text-primary">
                Name & Position
              </TableHead>
              <TableHead className="h-9 text-[10px] uppercase tracking-wide text-primary">
                Department
              </TableHead>
              <TableHead className="h-9 text-[10px] uppercase tracking-wide text-primary">
                Address
              </TableHead>
              <TableHead className="h-9 text-[10px] uppercase tracking-wide text-primary text-right">
                Rank
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const selected = employee.id === selectedEmployeeId;
              return (
                <TableRow
                  key={employee.id}
                  className={cn(
                    'group/row cursor-pointer border-0 bg-transparent',
                  )}
                  onClick={() => onSelectEmployee(employee.id)}
                >
                  <TableCell
                    className={cn(
                      'rounded-l-[8px] py-2 transition-colors',
                      selected
                        ? 'border-y border-l border-primary bg-background group-hover/row:bg-primary/10'
                        : 'bg-muted/60 group-hover/row:bg-muted/80',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {employee.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {employee.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {employee.role}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'py-2 text-xs text-foreground transition-colors',
                      selected
                        ? 'border-y border-primary bg-background group-hover/row:bg-primary/10'
                        : 'bg-muted/60 group-hover/row:bg-muted/80',
                    )}
                  >
                    {employee.department}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'py-2 text-xs text-muted-foreground transition-colors',
                      selected
                        ? 'border-y border-primary bg-background group-hover/row:bg-primary/10'
                        : 'bg-muted/60 group-hover/row:bg-muted/80',
                    )}
                  >
                    <p>{employee.email}</p>
                    <p>{employee.phone}</p>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'rounded-r-[8px] py-2 text-right transition-colors',
                      selected
                        ? 'border-y border-r border-primary bg-background group-hover/row:bg-primary/10'
                        : 'bg-muted/60 group-hover/row:bg-muted/80',
                    )}
                  >
                    <Badge
                      variant="outline"
                      className="h-[22px] rounded-[4px] border-primary px-[5px] py-[3px] text-[10px] font-bold leading-4 text-primary"
                    >
                      ⚡ {employee.rank}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

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
    </section>
  );
}
