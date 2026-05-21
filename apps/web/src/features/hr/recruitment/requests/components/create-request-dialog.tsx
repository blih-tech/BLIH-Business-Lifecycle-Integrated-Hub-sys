'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  DepartmentPermissions,
  JobPermissions,
  PositionPermissions,
} from '@repo/types/rbac/permissions.constants';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  applicationFormSchema,
  type ApplicationFormValues,
} from '@/features/hr/recruitment/requests/application-form-schema';
import {
  jobDetailsFormSchema,
  type JobDetailsFormValues,
} from '@/features/hr/recruitment/requests/job-details-schema';
import {
  createRequestFormSchema,
  type CreateRequestFormValues,
} from '@/features/hr/recruitment/requests/form-schema';
import type { CreateJobDto } from '@repo/types/recruitment/jobs';
import type { SubmittedJobRequest } from '@/features/hr/recruitment/requests/types';
import { ApplicationFormStep } from '@/features/hr/recruitment/requests/components/application-form-step';
import { JobDetailsStep } from '@/features/hr/recruitment/requests/components/job-details-step';
import { CreateDepartmentDialog } from '@/features/hr/departments/components/create-department-dialog';
import { CreatePositionDialog } from '@/features/hr/positions/components/create-position-dialog';
import { RequestFormStep } from '@/features/hr/recruitment/requests/components/request-form-step';
import {
  useCreateJob,
  useUpdateJob,
} from '@/features/hr/recruitment/requests/hooks/use-jobs';
import {
  useRecruitmentDepartments,
  useRecruitmentPositions,
  useRecruitmentUsers,
} from '@/features/hr/recruitment/requests/hooks/use-recruitment-reference-data';
import { queryKeys } from '@/lib/query-keys';
import { notifyPermissionDenied } from '@/shared/components/access/notify-permission-denied';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Form } from '@/shared/components/ui/form';
import { useHrAbility } from '@/shared/auth/hr-ability-context';

type CreateRequestDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentUserName: string;
  editRequest?: SubmittedJobRequest & { jobId?: string };
};

const steps = [
  {
    id: 1,
    title: 'Request Form',
    description: 'Internal hiring request details',
  },
  {
    id: 2,
    title: 'Job Details',
    description: 'Public job board information',
  },
  {
    id: 3,
    title: 'Application Form',
    description: 'Candidate application questions',
  },
] as const;

const defaultValues: CreateRequestFormValues = {
  jobTitle: '',
  department: '',
  requestedBy: 'User',
  position: '',
  requestType: 'NEW',
  replaceFor: '',
  businessJustification: '',
  employmentType: 'FULL_TIME',
  workMode: 'ON_SITE',
  urgency: 'MEDIUM',
  neededByDate: '',
  priority: 'MEDIUM',
};

const defaultJobDetailsValues: JobDetailsFormValues = {
  title: '',
  city: '',
  country: '',
  workLocationType: 'ON_SITE',
  employmentType: 'FULL_TIME',
  description: '',
  summary: '',
  responsibilities: '',
  requiredSkills: '',
  preferredSkills: '',
  experienceLevel: 'MID',
  contractType: 'PERMANENT',
  salaryMode: 'NOT_SPECIFIED',
  salaryMin: '',
  salaryMax: '',
  currency: '',
  benefits: '',
  tools: '',
  hiringManagerId: '',
  applicationDeadline: '',
  openings: '1',
};

const defaultApplicationValues: ApplicationFormValues = {
  applicantFields: [
    { key: 'FIRST_NAME', enabled: true, required: true },
    { key: 'LAST_NAME', enabled: true, required: true },
    { key: 'EMAIL', enabled: true, required: true },
    { key: 'PHONE', enabled: true, required: true },
    { key: 'RESUME_URL', enabled: false, required: false },
    { key: 'CURRENT_COMPANY', enabled: false, required: false },
    { key: 'YEARS_OF_EXPERIENCE', enabled: false, required: false },
    { key: 'LINKEDIN_URL', enabled: false, required: false },
    { key: 'PORTFOLIO_URL', enabled: false, required: false },
    { key: 'GITHUB_URL', enabled: false, required: false },
    { key: 'EXPECTED_SALARY', enabled: false, required: false },
    { key: 'COVER_LETTER', enabled: false, required: false },
  ],
  sections: [
    { key: 'EDUCATION', enabled: false, required: false },
    { key: 'EXPERIENCE', enabled: false, required: false },
  ],
  customFields: [],
};

export function CreateRequestDialog({
  open,
  onOpenChange,
  currentUserName,
  editRequest,
}: CreateRequestDialogProps) {
  const queryClient = useQueryClient();
  const { hasPermission } = useHrAbility();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createDepartmentOpen, setCreateDepartmentOpen] = useState(false);
  const [createPositionOpen, setCreatePositionOpen] = useState(false);
  const isEditMode = Boolean(editRequest?.jobId);
  const canCreateDepartment = hasPermission(DepartmentPermissions.CREATE);
  const canCreatePosition = hasPermission(PositionPermissions.CREATE);
  const requestForm = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      ...defaultValues,
      requestedBy: editRequest?.requestForm.requestedBy ?? currentUserName,
    },
  });
  const jobDetailsForm = useForm<JobDetailsFormValues>({
    resolver: zodResolver(jobDetailsFormSchema),
    mode: 'onSubmit',
    defaultValues: defaultJobDetailsValues,
  });
  const applicationForm = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    mode: 'onSubmit',
    defaultValues: defaultApplicationValues,
  });
  const selectedDepartment = requestForm.watch('department');
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useRecruitmentDepartments();
  const { data: positions = [], isLoading: isPositionsLoading } =
    useRecruitmentPositions(selectedDepartment || undefined);
  const { data: users = [], isLoading: isUsersLoading } = useRecruitmentUsers();
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob(editRequest?.jobId ?? '');

  const stepMeta = useMemo(
    () => steps.find((step) => step.id === currentStep) ?? steps[0],
    [currentStep],
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        value: department.id,
        label: department.name,
      })),
    [departments],
  );
  const selectedDepartmentName = useMemo(() => {
    if (!selectedDepartment) return '';
    return (
      departmentOptions.find((option) => option.value === selectedDepartment)
        ?.label ?? ''
    );
  }, [departmentOptions, selectedDepartment]);
  const positionOptions = useMemo(
    () =>
      positions.map((position) => ({
        value: position.id,
        label: position.title,
      })),
    [positions],
  );
  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user.id,
        label:
          `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
      })),
    [users],
  );

  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      requestForm.reset({
        ...defaultValues,
        requestedBy: editRequest?.requestForm.requestedBy ?? currentUserName,
      });
      jobDetailsForm.reset(defaultJobDetailsValues);
      applicationForm.reset(defaultApplicationValues);
    }
  }, [
    applicationForm,
    currentUserName,
    editRequest,
    jobDetailsForm,
    open,
    requestForm,
  ]);

  useEffect(() => {
    requestForm.setValue(
      'requestedBy',
      editRequest?.requestForm.requestedBy ?? currentUserName,
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      },
    );
  }, [currentUserName, editRequest, requestForm]);

  useEffect(() => {
    if (!open || !editRequest) return;
    requestForm.reset({
      ...defaultValues,
      ...editRequest.requestForm,
      requestedBy: editRequest.requestForm.requestedBy ?? currentUserName,
    });
    jobDetailsForm.reset({
      ...defaultJobDetailsValues,
      ...editRequest.jobDetailsForm,
    });
    applicationForm.reset({
      ...defaultApplicationValues,
      ...editRequest.applicationForm,
    });
  }, [
    applicationForm,
    currentUserName,
    editRequest,
    jobDetailsForm,
    open,
    requestForm,
  ]);

  async function handleRequestContinue() {
    const isValid = await requestForm.trigger();
    if (!isValid) return;
    const requestValues = requestForm.getValues();
    jobDetailsForm.setValue('title', requestValues.jobTitle, {
      shouldDirty: false,
    });
    jobDetailsForm.setValue('workLocationType', requestValues.workMode, {
      shouldDirty: false,
    });
    jobDetailsForm.setValue('employmentType', requestValues.employmentType, {
      shouldDirty: false,
    });
    setCurrentStep(2);
  }

  async function handleJobDetailsContinue() {
    const isValid = await jobDetailsForm.trigger();
    if (!isValid) return;
    setCurrentStep(3);
  }

  const toList = (value: string) =>
    value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

  const createRichTextJson = (content: string): Record<string, unknown> => ({
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        text: content,
      },
    ],
  });

  async function handleApplicationComplete() {
    const isValid = await applicationForm.trigger();
    if (!isValid) return;

    const requiredPermission = isEditMode
      ? JobPermissions.UPDATE
      : JobPermissions.CREATE;
    if (!hasPermission(requiredPermission)) {
      notifyPermissionDenied();
      return;
    }

    setIsLoading(true);
    try {
      const requestFormValues = requestForm.getValues();
      const jobDetailsValues = jobDetailsForm.getValues();
      const appFormValues = applicationForm.getValues();

      const payload: CreateJobDto = {
        requestForm: {
          jobTitle: requestFormValues.jobTitle,
          department: requestFormValues.department,
          requestedBy: currentUserName,
          position: requestFormValues.position,
          requestType: requestFormValues.requestType,
          replaceForUserId:
            requestFormValues.requestType === 'REPLACEMENT'
              ? requestFormValues.replaceFor
              : null,
          businessJustification: requestFormValues.businessJustification,
          employmentType: requestFormValues.employmentType,
          workMode: requestFormValues.workMode,
          urgency: requestFormValues.urgency,
          neededByDate: requestFormValues.neededByDate,
          priority: requestFormValues.priority,
        },
        job: {
          title: jobDetailsValues.title,
          departmentId: requestFormValues.department,
          positionId: requestFormValues.position,
          description: createRichTextJson(jobDetailsValues.description),
          summary: jobDetailsValues.summary
            ? createRichTextJson(jobDetailsValues.summary)
            : null,
          experienceLevel: jobDetailsValues.experienceLevel,
          contractType: jobDetailsValues.contractType,
          employmentType: jobDetailsValues.employmentType,
          workLocationType: jobDetailsValues.workLocationType,
          city: jobDetailsValues.city || null,
          country: jobDetailsValues.country || null,
          openings: parseInt(jobDetailsValues.openings || '1', 10),
          salaryMin: jobDetailsValues.salaryMin
            ? parseFloat(jobDetailsValues.salaryMin)
            : null,
          salaryMax: jobDetailsValues.salaryMax
            ? parseFloat(jobDetailsValues.salaryMax)
            : null,
          currency: jobDetailsValues.currency || null,
          salaryMode: jobDetailsValues.salaryMode,
          benefits: jobDetailsValues.benefits
            ? toList(jobDetailsValues.benefits)
            : [],
          requiredSkills: jobDetailsValues.requiredSkills
            ? toList(jobDetailsValues.requiredSkills)
            : [],
          preferredSkills: jobDetailsValues.preferredSkills
            ? toList(jobDetailsValues.preferredSkills)
            : [],
          responsibilities: jobDetailsValues.responsibilities
            ? toList(jobDetailsValues.responsibilities)
            : [],
          tools: jobDetailsValues.tools ? toList(jobDetailsValues.tools) : [],
          hiringManagerId: jobDetailsValues.hiringManagerId || null,
          applicationDeadline: jobDetailsValues.applicationDeadline || null,
        },
        applicationForm: {
          applicantFields: appFormValues.applicantFields,
          sections: appFormValues.sections,
          customFields: appFormValues.customFields.map((field) => ({
            ...field,
            type: field.type as import('@repo/types/recruitment/jobs').JobApplicationFieldType,
          })),
        },
      };

      console.log('createJobPayload', payload);

      if (isEditMode && editRequest?.jobId) {
        await updateJobMutation.mutateAsync(payload);
        toast.success('Hiring request updated');
      } else {
        await createJobMutation.mutateAsync(payload);
        toast.success('Hiring request created');
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hr.jobs.all(),
      });
      handleClose();
    } catch (error) {
      console.error('Failed to save job request:', error);
      toast.error(
        isEditMode
          ? 'Failed to update hiring request'
          : 'Failed to create hiring request',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[97vw] overflow-y-auto p-0 sm:w-[94vw] sm:max-w-[1080px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
        <DialogHeader className="border-b border-border p-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Step {currentStep} of 3
              </div>
              <DialogTitle className="ui-section-title text-foreground">
                {isEditMode ? 'Edit Hiring Request' : 'Create Hiring Request'}
              </DialogTitle>
              <DialogDescription className="ui-body text-muted-foreground">
                {stepMeta.description}
              </DialogDescription>
            </div>

            <div className="flex items-start">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isComplete = currentStep > step.id;
                const isLast = index === steps.length - 1;

                return (
                  <div
                    key={step.id}
                    className={`flex min-w-0 items-start ${isLast ? 'flex-none' : 'flex-1'}`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex flex-col items-center pt-0.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                            isActive
                              ? 'border-primary bg-primary text-primary-foreground'
                              : isComplete
                                ? 'border-primary bg-[rgba(30,102,247,0.12)] text-primary'
                                : 'border-border bg-background text-muted-foreground'
                          }`}
                        >
                          {isComplete ? <Check className="h-4 w-4" /> : step.id}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold ${
                            isActive || isComplete
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {!isLast ? (
                      <div className="mx-3 mt-4 h-px flex-1 bg-border">
                        <div
                          className={`h-px ${
                            isComplete
                              ? 'w-full bg-primary'
                              : 'w-full bg-border'
                          }`}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {currentStep === 1 ? (
          <Form {...requestForm}>
            <form
              className="space-y-0"
              onSubmit={(event) => event.preventDefault()}
            >
              <RequestFormStep
                form={requestForm}
                departmentOptions={departmentOptions}
                positionOptions={positionOptions}
                replaceForOptions={userOptions}
                canCreateDepartment={canCreateDepartment}
                onAddDepartment={() => setCreateDepartmentOpen(true)}
                canCreatePosition={canCreatePosition}
                onAddPosition={() => setCreatePositionOpen(true)}
              />

              <DialogFooter className="border-t border-border p-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={handleRequestContinue}
                >
                  Continue to Job Details
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}

        {currentStep === 2 ? (
          <Form {...jobDetailsForm}>
            <form
              className="space-y-0"
              onSubmit={(event) => event.preventDefault()}
            >
              <JobDetailsStep
                form={jobDetailsForm}
                hiringManagerOptions={userOptions}
              />

              <DialogFooter className="border-t border-border p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={handleJobDetailsContinue}
                >
                  Continue to Application Form
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}

        {currentStep === 3 ? (
          <Form {...applicationForm}>
            <form
              className="space-y-0"
              onSubmit={(event) => event.preventDefault()}
            >
              <ApplicationFormStep form={applicationForm} />

              <DialogFooter className="border-t border-border p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer"
                  disabled={
                    isLoading ||
                    isDepartmentsLoading ||
                    isPositionsLoading ||
                    isUsersLoading
                  }
                  onClick={handleApplicationComplete}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}
      </DialogContent>

      <CreateDepartmentDialog
        open={createDepartmentOpen}
        onOpenChange={setCreateDepartmentOpen}
        parentOptions={departmentOptions}
        onCreated={(department) => {
          requestForm.setValue('department', department.id, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          requestForm.setValue('position', '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
      />

      <CreatePositionDialog
        open={createPositionOpen}
        onOpenChange={setCreatePositionOpen}
        departmentId={selectedDepartment || undefined}
        departmentName={selectedDepartmentName || undefined}
        onCreated={(position) => {
          // If the position was created in a different department (newly created), update the department selection
          if (position.departmentId !== selectedDepartment) {
            requestForm.setValue('department', position.departmentId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }
          requestForm.setValue('position', position.id, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
      />
    </Dialog>
  );
}
