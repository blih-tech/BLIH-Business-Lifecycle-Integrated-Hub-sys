import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient, ApiError } from '@/lib/api-client';
import type { DirectoryEmployee } from '@/features/hr/people/directory/types';
import type { ArchiveEmployee } from '@/features/hr/people/archive/types';

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: null;
  meta: { timestamp: string; requestId: string; version: string };
};

export type EmployeeListItem = {
  id: string;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  departmentId: string | null;
  departmentName: string | null;
  employeeCode: string | null;
  positionId: string | null;
  positionTitle: string | null;
  employmentType: string;
  lifecycleStatus: string | null;
  hiredAt: string | null;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EXITED_STATUSES = new Set(['TERMINATED', 'RESIGNED', 'RETIRED']);

/** Shared query key — React Query dedupes the single network call across hooks. */
const EMPLOYEES_ALL_KEY = ['hr', 'employees', 'all'] as const;

function buildName(e: EmployeeListItem): string {
  const first = e.firstName ?? '';
  const last = e.lastName ?? '';
  return (
    [first, last].filter(Boolean).join(' ') ||
    e.email?.split('@')[0] ||
    'Unknown'
  );
}

function buildInitials(e: EmployeeListItem): string {
  const first = (e.firstName ?? '')[0] ?? '';
  const last = (e.lastName ?? '')[0] ?? '';
  return [first, last].filter(Boolean).join('').toUpperCase() || '??';
}

function formatEmploymentType(type: string): string {
  const map: Record<string, string> = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    INTERN: 'Intern',
    TEMPORARY: 'Temporary',
  };
  return map[type] ?? type;
}

function formatDate(isoString: string | null): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Mappers — convert API shape to frontend component types
// ---------------------------------------------------------------------------

export function mapToDirectoryEmployee(e: EmployeeListItem): DirectoryEmployee {
  const dept = e.departmentName ?? '';
  return {
    id: e.id,
    initials: buildInitials(e),
    name: buildName(e),
    role: e.positionTitle ?? 'No position assigned',
    department: dept || 'No department',
    email: e.email ?? '—',
    phone: e.phone ?? '—',
    rank: 0, // performance score — wired in Phase 5
    location: '—', // address — not in list endpoint
    startDate: formatDate(e.hiredAt),
    jobType: formatEmploymentType(e.employmentType),
    workHours: '—', // work schedule — not in list endpoint
    salary: '—', // compensation — not in list endpoint
    roleOverview: '—', // job description — not in list endpoint
    technicalDepartmentLabel: dept ? `${dept.toUpperCase()} DEPT.` : 'DEPT.',
  };
}

export function mapToArchiveEmployee(e: EmployeeListItem): ArchiveEmployee {
  const dept = e.departmentName ?? '';
  const leavingReason =
    e.lifecycleStatus === 'TERMINATED'
      ? 'Termination'
      : e.lifecycleStatus === 'RESIGNED'
        ? 'Resignation'
        : e.lifecycleStatus === 'RETIRED'
          ? 'Retirement'
          : '—';

  return {
    id: e.id,
    initials: buildInitials(e),
    name: buildName(e),
    role: e.positionTitle ?? 'No position assigned',
    department: dept || 'No department',
    email: e.email ?? '—',
    phone: e.phone ?? '—',
    exitedAt: '—', // requires offboarding API (Phase 6)
    startDate: formatDate(e.hiredAt),
    endDate: '—', // requires lifecycle/offboarding API (Phase 6)
    totalTenure: '—', // computed from start/end dates (Phase 6)
    salary: '—', // requires compensation API (Phase 8)
    resignationDate: '—', // requires offboarding API (Phase 6)
    leavingReason,
    clearanceStatus: 'Pending', // requires offboarding checklist API (Phase 6)
    avgScore: 0, // requires performance API (Phase 5)
    archivedFiles: 0, // requires documents API (Phase 6)
    documents: [], // requires documents API (Phase 6)
    technicalDepartmentLabel: dept ? `${dept.toUpperCase()} DEPT.` : 'DEPT.',
  };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** All employees (unfiltered). */
export function useEmployeeList() {
  return useQuery({
    queryKey: EMPLOYEES_ALL_KEY,
    queryFn: () =>
      apiClient.get<ApiEnvelope<EmployeeListItem[]>>('/hr/employees'),
    select: (res) => res.data ?? [],
  });
}

/** Active employees: all lifecycle statuses except exited ones. */
export function useActiveEmployees() {
  return useQuery({
    queryKey: EMPLOYEES_ALL_KEY,
    queryFn: () =>
      apiClient.get<ApiEnvelope<EmployeeListItem[]>>('/hr/employees'),
    select: (res) =>
      (res.data ?? []).filter(
        (e) => !EXITED_STATUSES.has(e.lifecycleStatus ?? ''),
      ),
  });
}

/** Exited employees: TERMINATED, RESIGNED, or RETIRED. */
export function useExitedEmployees() {
  return useQuery({
    queryKey: EMPLOYEES_ALL_KEY,
    queryFn: () =>
      apiClient.get<ApiEnvelope<EmployeeListItem[]>>('/hr/employees'),
    select: (res) =>
      (res.data ?? []).filter((e) =>
        EXITED_STATUSES.has(e.lifecycleStatus ?? ''),
      ),
  });
}

/** Create a new employee. Invalidates the list on success. */
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (data) => apiClient.post('/hr/employees', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EMPLOYEES_ALL_KEY });
    },
  });
}
