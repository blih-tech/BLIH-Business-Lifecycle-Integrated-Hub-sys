'use client';

import type { ReactNode } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import {
  salaryModeValues,
  type JobDetailsFormValues,
} from '@/features/hr/recruitment/requests/job-details-schema';
import { JobSummaryRichTextEditor } from '@/features/hr/recruitment/requests/components/job-summary-rich-text-editor';
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

type JobDetailsStepProps = {
  form: UseFormReturn<JobDetailsFormValues>;
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
  moreLabel?: string;
};

const workModeOptions = [
  { value: 'on_site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
] as const;

const employmentTypeOptions = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
] as const;

const experienceLevelOptions = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead Level' },
] as const;

const salaryCurrencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'KES', label: 'KES' },
  { value: 'ETB', label: 'ETB' },
] as const;

const salaryModeOptions = [
  { value: 'not_specified', label: 'Not Specified' },
  { value: 'range', label: 'Salary Range' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'competitive', label: 'Competitive' },
] as const satisfies ReadonlyArray<{
  value: (typeof salaryModeValues)[number];
  label: string;
}>;

function optionLabel(
  value: string | undefined,
  options: ReadonlyArray<{ value: string; label: string }>,
) {
  if (!value) return 'Not set';
  return options.find((option) => option.value === value)?.label ?? value;
}

function listPreview(value: string | undefined) {
  if (!value?.trim()) return { value: 'Not set' };
  const items = value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length === 0) return { value: 'Not set' };
  if (items.length === 1) return { value: items[0] ?? 'Not set' };
  return {
    value: items[0] ?? 'Not set',
    moreLabel: `+${items.length - 1} more`,
  };
}

function SummaryItem({ label, value, moreLabel }: SummaryItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/70 py-2.5 last:border-b-0 last:pb-0 first:pt-0">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="max-w-[190px] text-right">
        <p className="truncate text-xs font-medium text-foreground">{value}</p>
        {moreLabel ? (
          <p className="mt-1 text-[11px] text-muted-foreground">{moreLabel}</p>
        ) : null}
      </div>
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

export function JobDetailsStep({ form }: JobDetailsStepProps) {
  const [
    jobTitle,
    location,
    workMode,
    employmentType,
    experienceLevel,
    requirements,
    preferredSkills,
    keyResponsibilities,
    salaryMode,
    salaryRangeMin,
    salaryRangeMax,
    salaryCurrency,
    benefits,
  ] = useWatch({
    control: form.control,
    name: [
      'jobTitle',
      'location',
      'workMode',
      'employmentType',
      'experienceLevel',
      'requirements',
      'preferredSkills',
      'keyResponsibilities',
      'salaryMode',
      'salaryRangeMin',
      'salaryRangeMax',
      'salaryCurrency',
      'benefits',
    ],
  });
  const responsibilitiesPreview = listPreview(keyResponsibilities);
  const requirementsPreview = listPreview(requirements);
  const preferredSkillsPreview = listPreview(preferredSkills);
  const benefitsPreview = listPreview(benefits);

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.95fr)]">
        <div className="space-y-4">
          <FormSectionCard
            eyebrow="Overview"
            title="Role Overview"
            description="Define how the role appears to candidates."
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
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
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
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="ui-meta text-muted-foreground">
                      Experience Level
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceLevelOptions.map((option) => (
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
            eyebrow="Overview"
            title="About The Role"
            description="Write the opening summary and your value proposition."
          >
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="jobSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Job Summary
                    </FormLabel>
                    <FormControl>
                      <JobSummaryRichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Keep it clear, candidate-facing, and easy to scan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whyJoinUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Why Join Us
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Share the team culture, growth opportunities, or mission that makes this role compelling."
                        className="min-h-[110px] max-h-[110px] rounded-[10px] border-border bg-background text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSectionCard>

          <FormSectionCard
            eyebrow="Requirements"
            title="Responsibilities & Skills"
            description="Use one item per line for lists."
          >
            <div className="space-y-4">
              <div className="rounded-[14px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.9))] p-3.5">
                <FormField
                  control={form.control}
                  name="keyResponsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ui-meta text-muted-foreground">
                        Key Responsibilities
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={
                            'Lead frontend delivery\nCollaborate with product and design\nMaintain UI quality'
                          }
                          className="min-h-[140px] max-h-[140px] rounded-[10px] border-border bg-background text-sm"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Add one responsibility per line.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[14px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.9))] p-3.5">
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ui-meta text-muted-foreground">
                          Requirements
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={'React\nTypeScript\nAPI integration'}
                            className="min-h-[140px] max-h-[140px] rounded-[10px] border-border bg-background text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Add one requirement per line.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-[14px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.9))] p-3.5">
                  <FormField
                    control={form.control}
                    name="preferredSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ui-meta text-muted-foreground">
                          Preferred Skills
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={'Next.js\nDesign systems\nRecharts'}
                            className="min-h-[140px] max-h-[140px] rounded-[10px] border-border bg-background text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </FormSectionCard>
        </div>

        <div className="space-y-4">
          <FormSectionCard
            eyebrow="Compensation"
            title="Salary & Benefits"
            description="Choose how salary should appear on the job post."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="salaryMode"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="ui-meta text-muted-foreground">
                      Salary Type
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select salary type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {salaryModeOptions.map((option) => (
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
                name="salaryRangeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Salary From
                    </FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" disabled={salaryMode !== 'range'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryRangeMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Salary To
                    </FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" disabled={salaryMode !== 'range'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryCurrency"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="ui-meta text-muted-foreground">
                      Salary Currency
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background" disabled={salaryMode !== 'range'}>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {salaryCurrencyOptions.map((option) => (
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
                name="benefits"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="ui-meta text-muted-foreground">
                      Benefits
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={
                          'Health insurance\nLearning budget\nHybrid work support'
                        }
                        className="min-h-[120px] max-h-[120px] rounded-[10px] border-border bg-background text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Add one benefit per line.
                    </FormDescription>
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
                Job Post Snapshot
              </h3>
            </div>

            <div className="px-4 py-3.5">
              <div className="rounded-[16px] border border-border bg-background px-3.5 py-3.5">
                <p className="text-base font-semibold tracking-[-0.03em] text-foreground">
                  {jobTitle?.trim() || 'Untitled role'}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {location?.trim() || 'Location not set'}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {optionLabel(workMode, workModeOptions)}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {optionLabel(employmentType, employmentTypeOptions)}
                  </span>
                </div>
              </div>

              <div className="mt-3.5">
                <SummaryItem
                  label="Experience level"
                  value={optionLabel(experienceLevel, experienceLevelOptions)}
                />
                <SummaryItem
                  label="Responsibilities"
                  value={responsibilitiesPreview.value}
                  moreLabel={responsibilitiesPreview.moreLabel}
                />
                <SummaryItem
                  label="Requirements"
                  value={requirementsPreview.value}
                  moreLabel={requirementsPreview.moreLabel}
                />
                <SummaryItem
                  label="Preferred skills"
                  value={preferredSkillsPreview.value}
                  moreLabel={preferredSkillsPreview.moreLabel}
                />
                <SummaryItem
                  label="Salary"
                  value={
                    salaryMode === 'range' &&
                    salaryRangeMin?.trim() &&
                    salaryRangeMax?.trim() &&
                    salaryCurrency?.trim()
                      ? `${salaryCurrency} ${salaryRangeMin} - ${salaryRangeMax}`
                      : optionLabel(salaryMode, salaryModeOptions)
                  }
                />
                <SummaryItem
                  label="Benefits"
                  value={benefitsPreview.value}
                  moreLabel={benefitsPreview.moreLabel}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
