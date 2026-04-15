import { useQuery } from '@tanstack/react-query';

import { apiClient, ApiError } from '@/lib/api-client';

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  message: string;
  error: null;
  meta: { timestamp: string; requestId: string; version: string };
};

export type CountryOption = { id: string; name: string; code: string | null };
export type DepartmentOption = {
  id: string;
  name: string;
  parentId: string | null;
};
export type PositionOption = {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  isActive: boolean;
};

export function useCountries() {
  return useQuery({
    queryKey: ['reference', 'countries'],
    queryFn: () => apiClient.get<ApiEnvelope<CountryOption[]>>('/countries'),
    select: (res) => res.data ?? [],
    staleTime: 10 * 60 * 1000, // 10 min — reference data rarely changes
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['reference', 'departments'],
    queryFn: () =>
      apiClient.get<ApiEnvelope<DepartmentOption[]>>('/departments'),
    select: (res) => res.data ?? [],
    staleTime: 10 * 60 * 1000,
  });
}

export function usePositions(departmentId?: string) {
  return useQuery({
    queryKey: ['reference', 'positions', departmentId],
    queryFn: () =>
      apiClient.get<ApiEnvelope<PositionOption[]>>(
        '/positions',
        departmentId ? { departmentId } : undefined,
      ),
    select: (res) => res.data ?? [],
    staleTime: 10 * 60 * 1000,
  });
}

export { ApiError };
