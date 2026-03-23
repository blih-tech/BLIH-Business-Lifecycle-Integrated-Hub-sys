'use client';

import { useState } from 'react';

import {
  CreateProfileCard,
  EmployeeProfileCard,
  EmployeeProfileForm,
} from '@/features/hr/people/create/components';
import type { EmployeeProfileFormValues } from '@/features/hr/people/create/form-schema';
import {
  EMPLOYEE_PROFILE_PREVIEW,
  employeeDraftProfiles,
} from '@/features/hr/people/create/mock-data';
import type { EmployeeDraftProfile } from '@/features/hr/people/create/types';

export function PeopleCreateContent() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [drafts, setDrafts] = useState<EmployeeDraftProfile[]>(
    employeeDraftProfiles,
  );

  function handleFormSuccess(
    values: EmployeeProfileFormValues,
    action: 'create' | 'save-draft',
  ) {
    const newDraft: EmployeeDraftProfile = {
      id: `draft-${Date.now()}`,
      title: `${values.firstName} ${values.lastName} Profile`,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      previewImage: EMPLOYEE_PROFILE_PREVIEW,
    };

    if (action === 'save-draft') {
      setDrafts((prev) => [newDraft, ...prev]);
    }

    setIsFormVisible(false);
  }

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-8 px-4 py-4 md:px-5 md:py-5">
      {isFormVisible ? (
        <EmployeeProfileForm
          onCancel={() => setIsFormVisible(false)}
          onSuccess={handleFormSuccess}
        />
      ) : (
        <CreateProfileCard
          title="Create New Employee Profile"
          description="Add a new employee profile to your organization."
          onClick={() => setIsFormVisible(true)}
        />
      )}

      {!isFormVisible
        ? drafts.map((draft) => (
            <EmployeeProfileCard key={draft.id} draft={draft} />
          ))
        : null}

      {!isFormVisible && drafts.length === 0 ? (
        <section className="grid h-[240px] place-items-center rounded-[12px] border border-[#e5e5e5] bg-[#f8f8f8] p-6">
          <p className="text-sm tracking-[-0.1504px] text-[#666]">
            No employee profile drafts.
          </p>
        </section>
      ) : null}
    </main>
  );
}
