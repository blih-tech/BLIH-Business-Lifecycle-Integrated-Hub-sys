'use client';

import type { ReactNode } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import type { CreateRequestFormValues } from '@/features/hr/recruitment/requests/form-schema';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

type RequestFormStepProps = {
  form: UseFormReturn<CreateRequestFormValues>;
};

type FormSectionCardProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
};

type SummaryItemProps = {
  label: string;
  value: string;
};

const departmentOptions = [
  { value: 'technical', label: 'Technical Dept.' },
  { value: 'creative', label: 'Creative Dept.' },
  { value: 'digital_marketing', label: 'Digital Marketing Dept.' },
] as const;

const positionOptions = [
  { value: 'frontend_engineer', label: 'Frontend Engineer' },
  { value: 'backend_engineer', label: 'Backend Engineer' },
  { value: 'fullstack_engineer', label: 'Fullstack Engineer' },
  { value: 'qa_engineer', label: 'QA Engineer' },
  { value: 'devops_engineer', label: 'DevOps Engineer' },
  { value: 'ui_ux_designer', label: 'UI/UX Designer' },
  { value: 'product_designer', label: 'Product Designer' },
] as const;

const requestTypeOptions = [
  { value: 'new', label: 'New Role' },
  { value: 'replacement', label: 'Replacement' },
] as const;

const employeeOptions = [
  { value: 'emp-alice-njeri', label: 'Alice Njeri' },
  { value: 'emp-mercy-wanjiku', label: 'Mercy Wanjiku' },
  { value: 'emp-ian-mwangi', label: 'Ian Mwangi' },
  { value: 'emp-kevin-kiptoo', label: 'Kevin Kiptoo' },
  { value: 'emp-ruth-kinyanjui', label: 'Ruth Kinyanjui' },
] as const;

const employmentTypeOptions = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
] as const;

const workModeOptions = [
  { value: 'on_site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
] as const;

const urgencyOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

function optionLabel(
  value: string | undefined,
  options: ReadonlyArray<{ value: string; label: string }>,
) {
  if (!value) return 'Not set';
  return options.find((option) => option.value === value)?.label ?? value;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/70 py-2.5 last:border-b-0 last:pb-0 first:pt-0">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="max-w-[180px] text-right text-xs font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function FormSectionCard({
  title,
  description,
  eyebrow,
  children,
}: FormSectionCardProps) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-border/80 bg-background shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.92))] px-4 py-3">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function RequestFormStep({ form }: RequestFormStepProps) {
  const [
    jobTitle,
    department,
    requestedBy,
    position,
    requestType,
    replaceFor,
    employmentType,
    workMode,
    urgency,
    neededByDate,
  ] = useWatch({
    control: form.control,
    name: [
        'jobTitle',
        'department',
        'requestedBy',
        'position',
        'requestType',
        'replaceFor',
        'employmentType',
      'workMode',
      'urgency',
      'neededByDate',
    ],
  });

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.95fr)]">
        <div className="space-y-4">
          <FormSectionCard
            eyebrow="Basics"
            title="Request Basics"
            description="Capture the role, owning department, and requester information."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Job Title
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Product Designer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Department
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Requested By
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-muted text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Position
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSectionCard>

          <FormSectionCard
            eyebrow="Justification"
            title="Why This Role"
            description="Clarify whether this is a new role or backfill and explain the business case."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      New / Replacement
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select request type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {requestTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs opacity-0">
                      Reserved space
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="replaceFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Replace For
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={requestType !== 'replacement'}
                      >
                        <SelectTrigger className="w-full bg-background disabled:bg-muted disabled:text-muted-foreground">
                          <SelectValue
                            placeholder={
                              requestType === 'replacement'
                                ? 'Select employee'
                                : 'Not applicable'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessJustification"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="ui-meta text-muted-foreground">
                      Business Justification
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Explain the hiring need, team gap, expected impact, and why this role is needed now."
                        className="min-h-[250px] max-h-[250px] rounded-[10px] border-border bg-background text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Briefly explain why this role is needed now.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSectionCard>
        </div>

        <div className="space-y-4">
          <FormSectionCard
            eyebrow="Terms"
            title="Hiring Terms"
            description="Define the employment setup, urgency, and expected fill date."
          >
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Employment Type
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employmentTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Work Mode
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select work mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workModeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Urgency
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {urgencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="neededByDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Needed By Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSectionCard>

          <section className="overflow-hidden rounded-[18px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,1))] shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <div className="border-b border-border/70 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Live Summary
              </p>
              <h3 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-foreground">
                Request Snapshot
              </h3>
            </div>

            <div className="px-4 py-3.5">
              <div className="rounded-[16px] border border-border bg-background px-3.5 py-3.5">
                <p className="text-base font-semibold tracking-[-0.03em] text-foreground">
                  {jobTitle?.trim() || 'Untitled role request'}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {optionLabel(department, departmentOptions)}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {optionLabel(requestType, requestTypeOptions)}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {optionLabel(urgency, urgencyOptions)} Priority
                  </span>
                </div>
              </div>

              <div className="mt-3.5">
                <SummaryItem
                  label="Requested by"
                  value={requestedBy || 'User'}
                />
                <SummaryItem
                  label="Position"
                  value={optionLabel(position, positionOptions)}
                />
                <SummaryItem
                  label="Employment type"
                  value={optionLabel(employmentType, employmentTypeOptions)}
                />
                <SummaryItem
                  label="Work mode"
                  value={optionLabel(workMode, workModeOptions)}
                />
                <SummaryItem
                  label="Needed by"
                  value={neededByDate || 'Select a date'}
                />
                <SummaryItem
                  label="Replacement for"
                  value={
                    requestType === 'replacement'
                      ? optionLabel(replaceFor, employeeOptions)
                      : 'Not applicable'
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
