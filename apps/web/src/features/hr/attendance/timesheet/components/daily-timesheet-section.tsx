'use client';

import { useMemo, useState } from 'react';

import {
  dailyDateOptions,
  dailyRowsByDate,
  monthlySections,
  timesheetDepartments,
  weeklySections,
} from '@/features/hr/attendance/timesheet/mock-data';
import type {
  TimesheetRow,
  TimesheetSection,
  TimesheetSort,
  TimesheetStatus,
  TimesheetViewMode,
} from '@/features/hr/attendance/timesheet/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { TimesheetEntriesCard } from './timesheet-entries-card';
import { TimesheetFilters } from './timesheet-filters';
import { TimesheetPagination } from './timesheet-pagination';

type DailyDateValue = keyof typeof dailyRowsByDate;

function sortRows(rows: TimesheetRow[], sort: TimesheetSort) {
  return [...rows].sort((a, b) => {
    if (sort === 'name-desc') return b.name.localeCompare(a.name);
    return a.name.localeCompare(b.name);
  });
}

function filterRows(
  rows: TimesheetRow[],
  searchTerm: string,
  department: string,
  status: 'all' | TimesheetStatus,
  sort: TimesheetSort,
) {
  const query = searchTerm.trim().toLowerCase();

  const filtered = rows.filter((row) => {
    const byName = !query || row.name.toLowerCase().includes(query);
    const byDepartment = department === 'all' || row.department === department;
    const byStatus = status === 'all' || row.status === status;
    return byName && byDepartment && byStatus;
  });

  return sortRows(filtered, sort);
}

function filterSections(
  sections: TimesheetSection[],
  searchTerm: string,
  department: string,
  status: 'all' | TimesheetStatus,
  sort: TimesheetSort,
) {
  return sections
    .map((section) => ({
      ...section,
      rows: filterRows(section.rows, searchTerm, department, status, sort),
    }))
    .filter((section) => section.rows.length > 0);
}

export function DailyTimesheetSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState<string>('Marketing');
  const [status, setStatus] = useState<'all' | TimesheetStatus>('all');
  const [viewMode, setViewMode] = useState<TimesheetViewMode>('daily');
  const [sortBy, setSortBy] = useState<TimesheetSort>('name-asc');
  const [page, setPage] = useState(1);
  const [dailyDate, setDailyDate] = useState<DailyDateValue>(
    (dailyDateOptions[0]?.value as DailyDateValue) ?? '2025-12-14',
  );

  const perPage = viewMode === 'daily' ? 8 : 2;

  const filteredDailyRows = useMemo(
    () =>
      filterRows(
        dailyRowsByDate[dailyDate] ?? [],
        searchTerm,
        department,
        status,
        sortBy,
      ),
    [dailyDate, searchTerm, department, status, sortBy],
  );

  const filteredWeeklySections = useMemo(
    () =>
      filterSections(weeklySections, searchTerm, department, status, sortBy),
    [searchTerm, department, status, sortBy],
  );

  const filteredMonthlySections = useMemo(
    () =>
      filterSections(monthlySections, searchTerm, department, status, sortBy),
    [searchTerm, department, status, sortBy],
  );

  const { rowsForCard, sectionsForCard, totalPages, employeesFound } =
    useMemo(() => {
      if (viewMode === 'daily') {
        const pages = Math.max(
          1,
          Math.ceil(filteredDailyRows.length / perPage),
        );
        const currentPage = Math.min(page, pages);
        const start = (currentPage - 1) * perPage;
        const rows = filteredDailyRows.slice(start, start + perPage);
        return {
          rowsForCard: rows,
          sectionsForCard: [] as TimesheetSection[],
          totalPages: pages,
          employeesFound: filteredDailyRows.length,
        };
      }

      const sections =
        viewMode === 'weekly'
          ? filteredWeeklySections
          : filteredMonthlySections;
      const pages = Math.max(1, Math.ceil(sections.length / perPage));
      const currentPage = Math.min(page, pages);
      const start = (currentPage - 1) * perPage;
      const sliced = sections.slice(start, start + perPage);

      return {
        rowsForCard: [] as TimesheetRow[],
        sectionsForCard: sliced,
        totalPages: pages,
        employeesFound: sections.reduce(
          (count, section) => count + section.rows.length,
          0,
        ),
      };
    }, [
      viewMode,
      filteredDailyRows,
      filteredWeeklySections,
      filteredMonthlySections,
      page,
      perPage,
    ]);

  const safePage = Math.min(page, totalPages);

  return (
    <section className="space-y-8">
      <div>
        <p className="text-[22px] font-semibold tracking-[-0.3125px] text-black">
          Employee Timesheet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Calculated billable hours worked, leaves, and overtimes.
        </p>
      </div>

      <div className="space-y-4">
        <TimesheetFilters
          searchTerm={searchTerm}
          onSearchTermChange={(value) => {
            setSearchTerm(value);
            setPage(1);
          }}
          department={department}
          onDepartmentChange={(value) => {
            setDepartment(value);
            setPage(1);
          }}
          status={status}
          onStatusChange={(value: string) => {
            setStatus(value as 'all' | TimesheetStatus);
            setPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={(value: string) => {
            setViewMode(value as TimesheetViewMode);
            setPage(1);
          }}
          departments={timesheetDepartments}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-muted-foreground">
          <p>{employeesFound} employees found</p>

          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(value: string) =>
                setSortBy(value as TimesheetSort)
              }
            >
              <SelectTrigger
                size="sm"
                className="h-7 w-[138px] rounded-none border-0 border-b border-border bg-transparent px-1 text-xs text-foreground shadow-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <TimesheetEntriesCard
          viewMode={viewMode}
          rows={rowsForCard}
          sections={sectionsForCard}
          dailyDate={dailyDate}
          onDailyDateChange={(value) => {
            if (value in dailyRowsByDate) {
              setDailyDate(value as DailyDateValue);
            }
            setPage(1);
          }}
          dailyDateOptions={dailyDateOptions}
        />
        <TimesheetPagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
