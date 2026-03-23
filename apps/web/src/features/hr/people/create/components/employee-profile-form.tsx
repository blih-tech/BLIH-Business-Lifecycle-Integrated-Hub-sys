'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

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

type EmployeeProfileFormProps = {
  onCancel: () => void;
  onSuccess: (
    values: EmployeeProfileFormValues,
    action: 'create' | 'save-draft',
  ) => void;
};

export function EmployeeProfileForm({
  onCancel,
  onSuccess,
}: EmployeeProfileFormProps) {
  const [submitAction, setSubmitAction] = useState<'create' | 'save-draft'>(
    'create',
  );

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
      emergencyPhoneNumber: '',
      emergencyEmail: '',
      emergencyCity: '',
      emergencyCountryOfBirth: '',
    },
  });

  function onSubmit(values: EmployeeProfileFormValues) {
    onSuccess(values, submitAction);
    form.reset();
  }

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
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && submitAction === 'create' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Create
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="h-8 rounded-[6px] border-[#d9d9d9] bg-white px-4 text-sm text-black hover:bg-white"
              onClick={() => setSubmitAction('save-draft')}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && submitAction === 'save-draft' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save Draft
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-[6px] px-2 text-sm text-[#666] hover:bg-transparent"
              onClick={onCancel}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
