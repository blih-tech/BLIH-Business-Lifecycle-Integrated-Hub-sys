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
  { value: '1f31a301-dfb8-4071-aab1-ad6bc4891da7', label: 'Technical Department' },
  { value: '2c42b412-eca9-5182-bbc2-ce7cd5902e51', label: 'Creative Department' },
  { value: '3d53c523-fdb9-6293-ccd3-df8de6a3f62', label: 'Marketing Department' },
  { value: '4e64d634-aeea-73a4-dde4-eg9ef7b4g73', label: 'Operations Department' },
  { value: '5f75e745-bffb-84b5-ee5f-fh0gf8c5h84', label: 'Finance Department' },
] as const;

const positionOptions = [
  { value: '8b76752b-df18-45bc-af74-1ea9a0db2e40', label: 'Frontend Engineer' },
  { value: '9c87865c-eg29-56cd-bf85-2fb0b1ec3f51', label: 'Backend Engineer' },
  { value: 'ad98976d-fh30-67de-cg96-3gc1c2fd4g62', label: 'Fullstack Engineer' },
  { value: 'be09098e-gi41-78ef-dh07-4hd2d3ge5h73', label: 'QA Engineer' },
  { value: 'cf10109f-hj52-89fg-ei18-5ie3e4hf6i84', label: 'DevOps Engineer' },
  { value: 'dg21210g-ik63-90gh-fj29-6jf4f5ig7j95', label: 'UI/UX Designer' },
  { value: 'eh32311h-jl74-01hi-gk30-7kg5g6jh8k06', label: 'Product Designer' },
  { value: 'fi43412i-km85-12ij-hl41-8lh6h7ki9l17', label: 'Product Manager' },
  { value: 'gj54513j-ln96-23jk-im52-9mi7i8lj0m28', label: 'Data Analyst' },
  { value: 'hk65614k-mp07-34kl-jn63-0nj8j9mk1n39', label: 'Marketing Specialist' },
] as const;

const requestTypeOptions = [
  { value: 'NEW', label: 'New Role' },
  { value: 'REPLACEMENT', label: 'Replacement' },
] as const;

const employmentTypeOptions = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'TEMPORARY', label: 'Temporary' },
] as const;

const workModeOptions = [
  { value: 'ON_SITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
] as const;

const urgencyOptions = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
] as const;

const priorityOptions = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
] as const;

const replaceForOptions = [
  { value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', label: 'Alice Njeri' },
  { value: 'b2c3d4e5-f6a7-8901-bcde-f23456789012', label: 'Mercy Wanjiku' },
  { value: 'c3d4e5f6-a7b8-9012-cdef-345678901234', label: 'Ian Mwangi' },
  { value: 'd4e5f6a7-b8c9-0123-defg-456789012345', label: 'Kevin Kiptoo' },
  { value: 'e5f6a7b8-c9d0-1234-efgh-567890123456', label: 'Ruth Kinyanjui' },
  { value: 'f6a7b8c9-d0e1-2345-fghi-678901234567', label: 'John Ochieng' },
  { value: 'a7b8c9d0-e1f2-3456-ghij-789012345678', label: 'Sarah Akinyi' },
  { value: 'b8c9d0e1-f2a3-4567-hijk-890123456789', label: 'David Kamau' },
] as const;

function optionLabel(
  value: string | undefined,
  options: ReadonlyArray<{ value: string; label: string }>,
) {
  if (!value) return 'Not set';
  return options.find((option) => option.value === value)?.label ?? value;
}

function idToLabel(
  id: string | undefined,
  options: ReadonlyArray<{ value: string; label: string }>,
) {
  if (!id) return 'Not set';
  return options.find((option) => option.value === id)?.label ?? id;
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
    position,
    requestType,
    replaceFor,
    employmentType,
    workMode,
    urgency,
    neededByDate,
    priority,
  ] = useWatch({
    control: form.control,
    name: [
        'jobTitle',
        'department',
        'position',
        'requestType',
        'replaceFor',
        'employmentType',
        'workMode',
        'urgency',
        'neededByDate',
        'priority',
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={requestType !== 'REPLACEMENT'}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-background disabled:bg-muted disabled:text-muted-foreground">
                          <SelectValue
                            placeholder={
                              requestType === 'REPLACEMENT'
                                ? 'Select employee to replace'
                                : 'Not applicable'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {replaceForOptions.map((option) => (
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Priority
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as typeof field.value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
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
                    {idToLabel(department, departmentOptions)}
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
                  label="Department"
                  value={idToLabel(department, departmentOptions)}
                />
                <SummaryItem
                  label="Position"
                  value={idToLabel(position, positionOptions)}
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
                  label="Priority"
                  value={optionLabel(priority, priorityOptions)}
                />
                <SummaryItem
                  label="Needed by"
                  value={neededByDate || 'Select a date'}
                />
                <SummaryItem
                  label="Replacement for"
                  value={
                    requestType === 'REPLACEMENT'
                      ? idToLabel(replaceFor, replaceForOptions)
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