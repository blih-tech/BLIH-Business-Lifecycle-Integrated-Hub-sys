"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { jobDetailsFormSchema, type JobDetailsFormValues } from "@/features/hr/recruitment/requests/job-details-schema";
import { createRequestFormSchema, type CreateRequestFormValues } from "@/features/hr/recruitment/requests/form-schema";
import { JobDetailsStep } from "@/features/hr/recruitment/requests/components/job-details-step";
import { RequestFormStep } from "@/features/hr/recruitment/requests/components/request-form-step";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Form } from "@/shared/components/ui/form";

type CreateRequestDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentUserName: string;
};

const steps = [
  {
    id: 1,
    title: "Request Form",
    description: "Internal hiring request details",
  },
  {
    id: 2,
    title: "Job Details",
    description: "Public job board information",
  },
  {
    id: 3,
    title: "Application Form",
    description: "Candidate application questions",
  },
] as const;

const defaultValues: CreateRequestFormValues = {
  jobTitle: "",
  department: "",
  requestedBy: "User",
  position: "",
  requestType: "new",
  replaceFor: "",
  businessJustification: "",
  employmentType: "full_time",
  workMode: "on_site",
  urgency: "medium",
  neededByDate: "",
};

const defaultJobDetailsValues: JobDetailsFormValues = {
  jobTitle: "",
  location: "",
  workMode: "on_site",
  employmentType: "full_time",
  jobSummary: "",
  whyJoinUs: "",
  keyResponsibilities: "",
  requiredSkills: "",
  preferredSkills: "",
  experienceLevel: "mid",
  salaryRangeMin: "",
  salaryRangeMax: "",
  salaryCurrency: "",
  benefits: "",
};

function PlaceholderStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-4">
      <section className="ui-surface p-4">
        <h3 className="ui-section-title text-foreground">{title}</h3>
        <p className="ui-body mt-2 text-muted-foreground">{description}</p>
      </section>
    </div>
  );
}

export function CreateRequestDialog({ open, onOpenChange, currentUserName }: CreateRequestDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const requestForm = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestFormSchema),
    mode: "onSubmit",
    defaultValues: {
      ...defaultValues,
      requestedBy: currentUserName,
    },
  });
  const jobDetailsForm = useForm<JobDetailsFormValues>({
    resolver: zodResolver(jobDetailsFormSchema),
    mode: "onSubmit",
    defaultValues: defaultJobDetailsValues,
  });

  const stepMeta = useMemo(
    () => steps.find((step) => step.id === currentStep) ?? steps[0],
    [currentStep],
  );

  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      requestForm.reset({
        ...defaultValues,
        requestedBy: currentUserName,
      });
      jobDetailsForm.reset(defaultJobDetailsValues);
    }
  }, [currentUserName, jobDetailsForm, open, requestForm]);

  useEffect(() => {
    requestForm.setValue("requestedBy", currentUserName, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [currentUserName, requestForm]);

  async function handleRequestContinue() {
    const isValid = await requestForm.trigger();
    if (!isValid) return;
    const requestValues = requestForm.getValues();
    jobDetailsForm.setValue("jobTitle", requestValues.jobTitle, { shouldDirty: false });
    jobDetailsForm.setValue("workMode", requestValues.workMode, { shouldDirty: false });
    jobDetailsForm.setValue("employmentType", requestValues.employmentType, { shouldDirty: false });
    setCurrentStep(2);
  }

  async function handleJobDetailsContinue() {
    const isValid = await jobDetailsForm.trigger();
    if (!isValid) return;
    setCurrentStep(3);
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
              <DialogTitle className="ui-section-title text-foreground">Create Hiring Request</DialogTitle>
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
                    className={`flex min-w-0 items-start ${isLast ? "flex-none" : "flex-1"}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex flex-col items-center pt-0.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                            isActive
                              ? "border-primary bg-primary text-primary-foreground"
                              : isComplete
                                ? "border-primary bg-[rgba(30,102,247,0.12)] text-primary"
                                : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {isComplete ? <Check className="h-4 w-4" /> : step.id}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold ${
                            isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>

                    {!isLast ? (
                      <div className="mx-3 mt-4 h-px flex-1 bg-border">
                        <div
                          className={`h-px ${
                            isComplete ? "w-full bg-primary" : "w-full bg-border"
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
            <form className="space-y-0" onSubmit={(event) => event.preventDefault()}>
              <RequestFormStep form={requestForm} />

              <DialogFooter className="border-t border-border p-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="cursor-pointer" onClick={handleClose}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" className="cursor-pointer" onClick={handleRequestContinue}>
                  Continue to Job Details
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}

        {currentStep === 2 ? (
          <Form {...jobDetailsForm}>
            <form className="space-y-0" onSubmit={(event) => event.preventDefault()}>
              <JobDetailsStep form={jobDetailsForm} />

              <DialogFooter className="border-t border-border p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button type="button" className="cursor-pointer" onClick={handleJobDetailsContinue}>
                  Continue to Application Form
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-0">
            <PlaceholderStep
              title="Application Form"
              description="Candidate application questions and requirements will go here."
            />

            <DialogFooter className="border-t border-border p-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </Button>
              <Button type="button" className="cursor-pointer" disabled>
                Coming Next
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
