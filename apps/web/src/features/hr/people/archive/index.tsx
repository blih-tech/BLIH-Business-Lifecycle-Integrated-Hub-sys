'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  useExitedEmployees,
  mapToArchiveEmployee,
} from '@/hooks/hr/use-employees';
import {
  ArchiveTable,
  SelectedArchiveCard,
} from '@/features/hr/people/archive/components';

const PAGE_SIZE = 8;

export function PeopleArchiveContent() {
  const { data: rawEmployees = [], isLoading, isError } = useExitedEmployees();

  const employees = useMemo(
    () => rawEmployees.map(mapToArchiveEmployee),
    [rawEmployees],
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  // Auto-select first when data loads
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0]?.id ?? null);
    }
  }, [employees, selectedEmployeeId]);

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query),
    );
  }, [searchTerm, employees]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredEmployees]);

  const selectedEmployee =
    filteredEmployees.find((e) => e.id === selectedEmployeeId) ??
    filteredEmployees[0] ??
    null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1024px] space-y-8 px-4 py-4 md:px-5 md:py-5">
        <section>
          <h1 className="text-[18px] font-semibold tracking-[-0.3125px] text-foreground">
            Offboarded Employee History
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Archived data of no longer active employees.
          </p>
        </section>
        <section className="rounded-[12px] border border-border bg-card p-6">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <div key={i} className="h-12 rounded-[8px] bg-muted" />
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-[1024px] space-y-8 px-4 py-4 md:px-5 md:py-5">
        <section>
          <h1 className="text-[18px] font-semibold tracking-[-0.3125px] text-foreground">
            Offboarded Employee History
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Archived data of no longer active employees.
          </p>
        </section>
        <section className="rounded-[12px] border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">
            Unable to load archived employees
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check that the API is reachable and try again.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-8 px-4 py-4 md:px-5 md:py-5">
      <section>
        <h1 className="text-[18px] font-semibold tracking-[-0.3125px] text-foreground">
          Offboarded Employee History
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Archived data of no longer active employees.
        </p>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-6">
        {employees.length === 0 ? (
          <div className="grid h-[200px] place-items-center">
            <p className="text-sm text-muted-foreground">
              No archived employees found.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[545px_1fr]">
            <ArchiveTable
              employees={paginatedEmployees}
              totalEmployees={filteredEmployees.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              selectedEmployeeId={selectedEmployee?.id ?? null}
              onSelectEmployee={setSelectedEmployeeId}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
            {selectedEmployee ? (
              <SelectedArchiveCard employee={selectedEmployee} />
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
