'use client';

import { useEffect, useMemo, useState } from 'react';

import { archiveEmployees } from '@/features/hr/people/archive/mock-data';
import {
  ArchiveTable,
  SelectedArchiveCard,
} from '@/features/hr/people/archive/components';

const PAGE_SIZE = 8;

export function PeopleArchiveContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    archiveEmployees[0]?.id ?? null,
  );

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return archiveEmployees;
    return archiveEmployees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query)
      );
    });
  }, [searchTerm]);

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
    archiveEmployees[0];

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
      </section>
    </main>
  );
}
