import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProbation,
  deleteProbation,
  getEmployeeFull,
  getFinalEvaluation,
  getProbationById,
  getProbations,
  updateProbation,
} from '@/features/hr/onboarding/probation/api/probation.api';
import {
  createProbationKpi,
  deleteProbationKpi,
  getProbationKpis,
  updateProbationKpi,
} from '@/features/hr/onboarding/probation/api/probation-kpi.api';
import {
  createCheckpointEvaluation,
  createFinalEvaluation,
  updateCheckpointEvaluation,
} from '@/features/hr/onboarding/probation/api/evaluation.api';
import type {
  CreateCheckpointEvaluationDto,
  CreateFinalEvaluationDto,
  CreateProbationDto,
  CreateProbationKpiDto,
  UpdateCheckpointEvaluationDto,
  UpdateProbationDto,
  UpdateProbationKpiDto,
} from '@/types';
import { mapProbationToEmployee } from '../utils/mapProbation';

const PROBATION_QUERY_KEY = ['hr', 'onboarding', 'probation'] as const;

export function useProbations() {
  return useQuery({
    queryKey: [...PROBATION_QUERY_KEY, 'list'],
    queryFn: getProbations,
  });
}

export function useProbation(id: string) {
  return useQuery({
    queryKey: [...PROBATION_QUERY_KEY, 'detail', id],
    queryFn: () => getProbationById(id),
    enabled: Boolean(id),
  });
}

export function useProbationEmployees() {
  return useQuery({
    queryKey: [...PROBATION_QUERY_KEY, 'employees'],
    queryFn: async () => {
      const plans = await getProbations();
      return Promise.all(
        plans.map(async (plan) => {
          const [employee, evaluation] = await Promise.all([
            getEmployeeFull(plan.employeeId).catch(() => null),
            getFinalEvaluation(plan.id),
          ]);
          return mapProbationToEmployee(plan, evaluation, employee);
        }),
      );
    },
  });
}

export function useCreateProbation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProbationDto) => createProbation(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}

export function useUpdateProbation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProbationDto) => updateProbation(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}

export function useDeleteProbation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProbation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}

export function useProbationKpis(probationId?: string) {
  return useQuery({
    queryKey: [...PROBATION_QUERY_KEY, 'kpis', probationId ?? 'all'],
    queryFn: () => getProbationKpis(probationId),
  });
}

export function useCreateProbationKpi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProbationKpiDto) => createProbationKpi(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}

export function useUpdateProbationKpi(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProbationKpiDto) => updateProbationKpi(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}

export function useDeleteProbationKpi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProbationKpi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}

export function useCreateCheckpointEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCheckpointEvaluationDto) =>
      createCheckpointEvaluation(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}

export function useUpdateCheckpointEvaluation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCheckpointEvaluationDto) =>
      updateCheckpointEvaluation(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}

export function useCreateFinalEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFinalEvaluationDto) => createFinalEvaluation(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROBATION_QUERY_KEY });
    },
  });
}
