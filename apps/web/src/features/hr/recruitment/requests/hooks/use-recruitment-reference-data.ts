import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown;
  meta: { timestamp: string; requestId: string; version: string };
};

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

export type UserOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
};

export function useRecruitmentDepartments() {
  return useQuery({
    queryKey: ['reference', 'departments', 'recruitment'],
    queryFn: () =>
      apiClient.get<ApiEnvelope<DepartmentOption[]>>('/departments'),
    select: (response) => response.data ?? [],
    staleTime: 10 * 60 * 1000,
  });
}

export function useRecruitmentPositions(departmentId?: string) {
  return useQuery({
    queryKey: ['reference', 'positions', 'recruitment', departmentId],
    queryFn: () =>
      apiClient.get<ApiEnvelope<PositionOption[]>>(
        '/positions',
        departmentId
          ? { departmentId, isActive: 'true' }
          : { isActive: 'true' },
      ),
    select: (response) => response.data ?? [],
    staleTime: 10 * 60 * 1000,
  });
}

export function useRecruitmentUsers() {
  return useQuery({
    queryKey: ['reference', 'users', 'recruitment'],
    queryFn: () => apiClient.get<ApiEnvelope<UserOption[]>>('/users'),
    select: (response) =>
      (response.data ?? []).filter((user) => user.status === 'ACTIVE'),
    staleTime: 5 * 60 * 1000,
  });
}
