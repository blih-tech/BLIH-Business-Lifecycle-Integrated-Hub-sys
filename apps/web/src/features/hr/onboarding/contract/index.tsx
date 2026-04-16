'use client';

import { useEffect, useState } from 'react';

import { ContractCard } from '@/features/hr/onboarding/contract/components';
import type { EmploymentContract } from '@/features/hr/onboarding/contract/types';

import {
  getContracts,
  submitContract,
  verifyContract,
} from './api/contract.api';

/* import { ProgressStatCard } from "@/features/hr/onboarding/progress/components"; */

export function OnboardingContractContent() {
  const [contracts, setContracts] = useState<EmploymentContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getContracts();
        setContracts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const updateLocalState = (
    taskId: string,
    status: EmploymentContract['status'],
  ) => {
    setContracts((prev) =>
      prev.map((c) => (c.taskId === taskId ? { ...c, status } : c)),
    );
  };

  const handleSubmit = async (taskId: string, contractId: string) => {
    await submitContract(taskId, contractId);
    updateLocalState(taskId, 'SUBMITTED');
  };

  const handleApprove = async (taskId: string) => {
    await verifyContract(taskId, true);
    updateLocalState(taskId, 'COMPLETED');
  };

  const handleReject = async (taskId: string) => {
    await verifyContract(taskId, false);
    updateLocalState(taskId, 'CHANGES_REQUESTED');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className="mx-auto max-w-[1024px] space-y-5 p-4">
      <section>
        <h2 className="text-xl font-semibold">Employment Contracts</h2>

        <div className="mt-4 space-y-3">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onSubmit={() => handleSubmit(contract.taskId, contract.id)}
              onApprove={() => handleApprove(contract.taskId)}
              onReject={() => handleReject(contract.taskId)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
