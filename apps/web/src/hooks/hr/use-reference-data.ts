import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateDepartmentDto,
  CreatePositionDto,
  PositionResponseDto,
} from '@repo/types';

import { apiClient, ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';

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

/** Create a department and refresh department reference queries. */
export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation<DepartmentOption, ApiError, CreateDepartmentDto>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiEnvelope<DepartmentOption>>(
        '/departments',
        payload,
      );
      if (!response.data) {
        throw new ApiError('Department was not returned by the server', 500);
      }
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.hr.departments(),
      });
      void queryClient.invalidateQueries({
        queryKey: ['reference', 'departments'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['reference', 'departments', 'recruitment'],
      });
    },
  });
}

function mapPositionResponse(position: PositionResponseDto): PositionOption {
  return {
    id: position.id,
    title: position.title,
    departmentId: position.departmentId,
    departmentName: position.departmentName,
    isActive: position.isActive,
  };
}

/** Create a position and refresh position reference queries. */
export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation<PositionOption, ApiError, CreatePositionDto>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiEnvelope<PositionResponseDto>>(
        '/positions',
        payload,
      );
      if (!response.data) {
        throw new ApiError('Position was not returned by the server', 500);
      }
      return mapPositionResponse(response.data);
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.hr.positions(),
      });
      void queryClient.invalidateQueries({
        queryKey: ['reference', 'positions'],
      });

      const deptId = variables.departmentId || data.departmentId;

      void queryClient.invalidateQueries({
        queryKey: ['reference', 'positions', deptId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['reference', 'positions', 'recruitment', deptId],
      });

      // If departmentName was used, a new department might have been created
      if (variables.departmentName) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.hr.departments(),
        });
        void queryClient.invalidateQueries({
          queryKey: ['reference', 'departments'],
        });
      }
    },
  });
}

export { ApiError };
