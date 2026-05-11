'use client';

import type { ReactNode } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import {
  salaryModeValues,
  type JobDetailsFormValues,
} from '@/features/hr/recruitment/requests/job-details-schema';
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
  hiringManagerOptions: ReadonlyArray<{ value: string; label: string }>;
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

const workLocationTypeOptions = [
  { value: 'ON_SITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
] as const;

const employmentTypeOptions = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'TEMPORARY', label: 'Temporary' },
] as const;

const experienceLevelOptions = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'JUNIOR', label: 'Junior Level' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead Level' },
  { value: 'PRINCIPAL', label: 'Principal Level' },
] as const;

const contractTypeOptions = [
  { value: 'PERMANENT', label: 'Permanent' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
] as const;

const salaryCurrencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'KES', label: 'KES' },
  { value: 'ETB', label: 'ETB' },
] as const;

const salaryModeOptions = [
  { value: 'NOT_SPECIFIED', label: 'Not Specified' },
  { value: 'FIXED', label: 'Fixed Salary' },
  { value: 'NEGOTIABLE', label: 'Negotiable' },
  { value: 'COMPETITIVE', label: 'Competitive' },
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

function idToLabel(
  id: string | undefined,
  options: ReadonlyArray<{ value: string; label: string }>,
) {
  if (!id) return 'Not set';
  return options.find((option) => option.value === id)?.label ?? id;
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

export function JobDetailsStep({
  form,
  hiringManagerOptions,
}: JobDetailsStepProps) {
  const [
    title,
    city,
    workLocationType,
    employmentType,
    experienceLevel,
    contractType,
    responsibilities,
    requiredSkills,
    preferredSkills,
    salaryMode,
    salaryMin,
    salaryMax,
    currency,
    benefits,
    tools,
    openings,
    hiringManagerId,
  ] = useWatch({
    control: form.control,
    name: [
      'title',
      'city',
      'workLocationType',
      'employmentType',
      'experienceLevel',
      'contractType',
      'responsibilities',
      'requiredSkills',
      'preferredSkills',
      'salaryMode',
      'salaryMin',
      'salaryMax',
      'currency',
      'benefits',
      'tools',
      'openings',
      'hiringManagerId',
    ],
  });
  const responsibilitiesPreview = listPreview(responsibilities);
  const requiredSkillsPreview = listPreview(requiredSkills);
  const preferredSkillsPreview = listPreview(preferredSkills);
  const benefitsPreview = listPreview(benefits);
  const toolsPreview = listPreview(tools);
  const hasStructuredSalary =
    salaryMode === 'FIXED' ||
    salaryMode === 'NEGOTIABLE' ||
    salaryMode === 'COMPETITIVE';

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
                name="title"
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
                name="openings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Number of Openings
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      City
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nairobi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Country
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Kenya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workLocationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Work Location Type
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select work mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workLocationTypeOptions.map((option) => (
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
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Contract Type
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contractTypeOptions.map((option) => (
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
                  <FormItem>
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

              <FormField
                control={form.control}
                name="hiringManagerId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="ui-meta text-muted-foreground">
                      Hiring Manager
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select hiring manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hiringManagerOptions.map((option) => (
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
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="ui-meta text-muted-foreground">
                      Application Deadline
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

          <FormSectionCard
            eyebrow="Overview"
            title="About The Role"
            description="Write the opening summary and your value proposition."
          >
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Job Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                        className="min-h-[180px] max-h-[180px] rounded-[10px] border-border bg-background text-sm"
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
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ui-meta text-muted-foreground">
                      Summary (Why Join Us)
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
                  name="responsibilities"
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
                    name="requiredSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ui-meta text-muted-foreground">
                          Required Skills
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={'React\nTypeScript\nAPI integration'}
                            className="min-h-[140px] max-h-[140px] rounded-[10px] border-border bg-background text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Add one skill per line.
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

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[14px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.9))] p-3.5">
                  <FormField
                    control={form.control}
                    name="tools"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ui-meta text-muted-foreground">
                          Tools
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={'Figma\nJira\nGitHub'}
                            className="min-h-[100px] max-h-[100px] rounded-[10px] border-border bg-background text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Add one tool per line.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-[14px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.9))] p-3.5">
                  <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ui-meta text-muted-foreground">
                          Benefits
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={
                              'Health insurance\nLearning budget\nHybrid work support'
                            }
                            className="min-h-[100px] max-h-[100px] rounded-[10px] border-border bg-background text-sm"
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

              {hasStructuredSalary && (
                <>
                  <FormField
                    control={form.control}
                    name="salaryMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ui-meta text-muted-foreground">
                          {salaryMode === 'FIXED'
                            ? 'Salary Amount'
                            : 'Salary From'}
                        </FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {salaryMode === 'COMPETITIVE' && (
                    <FormField
                      control={form.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ui-meta text-muted-foreground">
                            Salary To
                          </FormLabel>
                          <FormControl>
                            <Input inputMode="numeric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem
                        className={
                          salaryMode === 'COMPETITIVE' ? 'md:col-span-2' : ''
                        }
                      >
                        <FormLabel className="ui-meta text-muted-foreground">
                          Salary Currency
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {salaryCurrencyOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
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
                  {title?.trim() || 'Untitled role'}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {city?.trim() || 'Location not set'}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {optionLabel(workLocationType, workLocationTypeOptions)}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {optionLabel(employmentType, employmentTypeOptions)}
                  </span>
                </div>
              </div>

              <div className="mt-3.5">
                <SummaryItem label="Openings" value={openings || '1'} />
                <SummaryItem
                  label="Hiring manager"
                  value={idToLabel(hiringManagerId, hiringManagerOptions)}
                />
                <SummaryItem
                  label="Contract type"
                  value={optionLabel(contractType, contractTypeOptions)}
                />
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
                  label="Required skills"
                  value={requiredSkillsPreview.value}
                  moreLabel={requiredSkillsPreview.moreLabel}
                />
                <SummaryItem
                  label="Preferred skills"
                  value={preferredSkillsPreview.value}
                  moreLabel={preferredSkillsPreview.moreLabel}
                />
                <SummaryItem
                  label="Tools"
                  value={toolsPreview.value}
                  moreLabel={toolsPreview.moreLabel}
                />
                <SummaryItem
                  label="Salary"
                  value={
                    salaryMode === 'FIXED' &&
                    salaryMin?.trim() &&
                    currency?.trim()
                      ? `${currency} ${salaryMin}`
                      : salaryMode === 'COMPETITIVE' &&
                          salaryMin?.trim() &&
                          salaryMax?.trim() &&
                          currency?.trim()
                        ? `${currency} ${salaryMin} - ${salaryMax}`
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
