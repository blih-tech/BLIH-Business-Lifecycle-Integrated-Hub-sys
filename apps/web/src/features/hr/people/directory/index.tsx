'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  useActiveEmployees,
  mapToDirectoryEmployee,
} from '@/hooks/hr/use-employees';
import {
  EmployeeTable,
  SelectedEmployeeCard,
} from '@/features/hr/people/directory/components';

const PAGE_SIZE = 8;

export function PeopleDirectoryContent() {
  const { data: rawEmployees = [], isLoading, isError } = useActiveEmployees();

  const employees = useMemo(
    () => rawEmployees.map(mapToDirectoryEmployee),
    [rawEmployees],
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  // Auto-select the first employee once data arrives
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
        emp.email.toLowerCase().includes(query) ||
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
    filteredEmployees.find((emp) => emp.id === selectedEmployeeId) ??
    filteredEmployees[0] ??
    null;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
        <section>
          <h1 className="text-[28px] font-semibold tracking-[-0.44px] text-foreground">
            All Employees &amp; Profiles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Directory of employees and profiles
          </p>
        </section>
        <section className="rounded-[12px] border border-border bg-card p-4">
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
      <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
        <section>
          <h1 className="text-[28px] font-semibold tracking-[-0.44px] text-foreground">
            All Employees &amp; Profiles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Directory of employees and profiles
          </p>
        </section>
        <section className="rounded-[12px] border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">
            Unable to load employees
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check that the API is reachable and try again.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section>
        <h1 className="text-[28px] font-semibold tracking-[-0.44px] text-foreground">
          All Employees &amp; Profiles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Directory of employees and profiles
        </p>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-3 md:p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
          <EmployeeTable
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
            <SelectedEmployeeCard employee={selectedEmployee} />
          ) : null}
        </div>
      </section>
    </main>
  );
}
