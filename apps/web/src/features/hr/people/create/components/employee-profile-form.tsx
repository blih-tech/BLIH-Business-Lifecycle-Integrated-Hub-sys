'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  employeeProfileFormSchema,
  type EmployeeProfileFormValues,
} from '@/features/hr/people/create/form-schema';
import { AssetsCredentialsSection } from '@/features/hr/people/create/components/assets-credentials-section';
import { BankDetailsSection } from '@/features/hr/people/create/components/bank-details-section';
import { BasicInfoSection } from '@/features/hr/people/create/components/basic-info-section';
import { ContractCompensationSection } from '@/features/hr/people/create/components/contract-compensation-section';
import { DocumentsSection } from '@/features/hr/people/create/components/documents-section';
import { EmergencyContactSection } from '@/features/hr/people/create/components/emergency-contact-section';
import { EmploymentInfoSection } from '@/features/hr/people/create/components/employment-info-section';
import { KpiOkrSection } from '@/features/hr/people/create/components/kpi-okr-section';
import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';
import { useCreateEmployee } from '@/hooks/hr/use-employees';
import { ApiError } from '@/lib/api-client';

type EmployeeProfileFormProps = {
  onCancel: () => void;
  onSaveDraft: (values: EmployeeProfileFormValues) => void;
};

function buildPayload(
  values: EmployeeProfileFormValues,
): Record<string, unknown> {
  const bankAccounts: Record<string, unknown>[] = [
    {
      bankName: 'Awash',
      accountName: values.awashBankAccountName,
      accountNumber: values.awashBankAccountNumber,
      isPrimary: true,
      isActive: true,
    },
  ];

  if (values.dashenBankAccountName && values.dashenBankAccountNumber) {
    bankAccounts.push({
      bankName: 'Dashen',
      accountName: values.dashenBankAccountName,
      accountNumber: values.dashenBankAccountNumber,
      isPrimary: false,
      isActive: true,
    });
  }

  const payload: Record<string, unknown> = {
    firstName: values.firstName,
    lastName: values.lastName,
    primaryEmail: values.email,
    primaryPhone: values.phoneNumber,
    additionalEmail: '',
    additionalPhone: values.additionalPhoneNumber ?? '',
    additionalPhoneType: 'MOBILE',
    address: {
      countryId: values.countryOfBirth,
      city: values.city,
    },
    bankAccounts,
    emergencyContacts: [
      {
        firstName: values.emergencyFirstName,
        lastName: values.emergencyLastName,
        relationship: values.emergencyRelationship,
        primaryPhone: values.emergencyPhoneNumber,
        email: values.emergencyEmail || null,
        city: values.emergencyCity || null,
        isFirstToCall: true,
        isActive: true,
      },
    ],
    educations: [],
  };

  // Optional: employment details
  if (values.rolePosition || values.startDate) {
    payload.employment = {
      ...(values.rolePosition ? { positionId: values.rolePosition } : {}),
      ...(values.startDate ? { hiredAt: values.startDate } : {}),
      employmentType: 'FULL_TIME',
    };
  }

  // Optional: compensation
  if (values.annualSalary) {
    payload.compensation = {
      baseSalary: values.annualSalary.replace(/,/g, ''),
      currency: 'ETB',
      ...(values.startDate ? { effectiveFrom: values.startDate } : {}),
    };
  }

  // Optional: profile
  if (values.dateOfBirth) {
    payload.profile = { dateOfBirth: values.dateOfBirth };
  }

  return payload;
}

export function EmployeeProfileForm({
  onCancel,
  onSaveDraft,
}: EmployeeProfileFormProps) {
  const [submitAction, setSubmitAction] = useState<'create' | 'save-draft'>(
    'create',
  );
  const router = useRouter();
  const createEmployee = useCreateEmployee();

  const form = useForm<EmployeeProfileFormValues>({
    resolver: zodResolver(employeeProfileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phoneNumber: '',
      additionalPhoneNumber: '',
      city: '',
      countryOfBirth: '',
      offerLetterUpload: '',
      offerLetterSource: '',
      department: '',
      reportingTo: '',
      rolePosition: '',
      startDate: '',
      annualSalary: '',
      probationPeriod: '',
      compensationNotes: '',
      awashBankAccountName: '',
      awashBankAccountNumber: '',
      dashenBankAccountName: '',
      dashenBankAccountNumber: '',
      kpiTarget1: '',
      kpiTarget2: '',
      kpiTarget3: '',
      okrTarget1: '',
      okrTarget2: '',
      assetResponsibleFor: '',
      laptopModel: '',
      serialNumber: '',
      credentialResponsibleFor: '',
      credentialType1: '',
      credentialType2: '',
      faydaIdDocument: '',
      experienceCertificate: '',
      educationalDocument: '',
      recommendationLetters: '',
      emergencyFirstName: '',
      emergencyLastName: '',
      emergencyRelationship: '',
      emergencyPhoneNumber: '',
      emergencyEmail: '',
      emergencyCity: '',
      emergencyCountryOfBirth: '',
    },
  });

  async function onSubmit(values: EmployeeProfileFormValues) {
    if (submitAction === 'save-draft') {
      onSaveDraft(values);
      form.reset();
      return;
    }

    try {
      await createEmployee.mutateAsync(buildPayload(values));
      toast.success('Employee created successfully');
      router.push('/dashboard/hr/people/directory');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to create employee. Please try again.';
      toast.error(message);
    }
  }

  const isPending = form.formState.isSubmitting || createEmployee.isPending;

  return (
    <section className="rounded-[12px] border border-[#e5e5e5] bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold tracking-[-0.3125px] text-black">
        Employee Profile Form
      </h2>
      <p className="mt-1 text-sm tracking-[-0.1504px] text-[#666]">
        Fill all required details before creating a profile.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <BasicInfoSection />
          <div className="grid gap-4 md:grid-cols-2 md:gap-8">
            <EmploymentInfoSection />
            <ContractCompensationSection />
          </div>
          <BankDetailsSection />
          <KpiOkrSection />
          <AssetsCredentialsSection />
          <DocumentsSection />
          <EmergencyContactSection />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="submit"
              className="h-8 rounded-[6px] px-4 text-sm"
              onClick={() => setSubmitAction('create')}
              disabled={isPending}
            >
              {isPending && submitAction === 'create' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Create
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="h-8 rounded-[6px] border-[#d9d9d9] bg-white px-4 text-sm text-black hover:bg-white"
              onClick={() => setSubmitAction('save-draft')}
              disabled={isPending}
            >
              {isPending && submitAction === 'save-draft' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save Draft
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-[6px] px-2 text-sm text-[#666] hover:bg-transparent"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
