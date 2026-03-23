'use client';

import { useEffect, useMemo, useState } from 'react';

import { directoryEmployees } from '@/features/hr/people/directory/mock-data';
import {
  EmployeeTable,
  SelectedEmployeeCard,
} from '@/features/hr/people/directory/components';

const PAGE_SIZE = 8;

export function PeopleDirectoryContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    directoryEmployees[0]?.id ?? null,
  );

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return directoryEmployees;
    return directoryEmployees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
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
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredEmployees]);

  const selectedEmployee =
    filteredEmployees.find((employee) => employee.id === selectedEmployeeId) ??
    filteredEmployees[0] ??
    directoryEmployees[0];

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-5 px-4 py-4 md:px-5 md:py-5">
      <section>
        <h1 className="text-[28px] font-semibold tracking-[-0.44px] text-foreground">
          All Employees & Profiles
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
