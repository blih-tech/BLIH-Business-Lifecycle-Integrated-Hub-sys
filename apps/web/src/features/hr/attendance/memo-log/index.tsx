'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  attendanceMemoStats,
  memoCards,
  previousMemoRows,
} from '@/features/hr/attendance/memo-log/mock-data';
import {
  MemoRequestCard,
  PreviousMemoTable,
  SelectedMemoCard,
  StatsGrid,
} from '@/features/hr/attendance/memo-log/components';

const PAGE_SIZE = 8;

export * from '@/features/hr/attendance/memo-log/components';
export * from '@/features/hr/attendance/memo-log/types';

export function AttendanceMemoLogContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    previousMemoRows[0]?.id ?? null,
  );

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return previousMemoRows;
    return previousMemoRows.filter((row) => {
      return (
        row.name.toLowerCase().includes(query) ||
        row.role.toLowerCase().includes(query) ||
        row.department.toLowerCase().includes(query)
      );
    });
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  const selectedRequest =
    filteredRows.find((row) => row.id === selectedRequestId) ??
    filteredRows[0] ??
    previousMemoRows[0];

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-10 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={attendanceMemoStats} />

      <section className="space-y-6">
        <div>
          <h1 className="text-[18px] font-semibold tracking-[-0.3125px] text-foreground">
            Memo Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Punctuality logs pending approval.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {memoCards.map((request) => (
            <MemoRequestCard key={request.id} request={request} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.3125px] text-foreground">
            Previous Memo logs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Archived memo log records.
          </p>
        </div>

        <div className="rounded-[12px] border border-border bg-card p-4">
          <div className="grid gap-6 lg:grid-cols-[545px_1fr]">
            <PreviousMemoTable
              rows={paginatedRows}
              totalRows={filteredRows.length}
              currentPage={currentPage}
              totalPages={totalPages}
              selectedId={selectedRequest?.id ?? null}
              onSelect={setSelectedRequestId}
              onPageChange={setCurrentPage}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
            {selectedRequest ? (
              <SelectedMemoCard request={selectedRequest} />
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
