'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type {
  CareerApplicationField,
  CareerJob,
} from '@/features/careers/data';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

type CareerApplicationFormProps = {
  job: CareerJob;
};

type ApplicationValue = string | boolean | File | null;

function getInitialValues(fields: CareerApplicationField[]) {
  return fields.reduce<Record<string, ApplicationValue>>((acc, field) => {
    acc[field.key] = field.type === 'CHECKBOX' ? false : null;
    if (field.type !== 'CHECKBOX' && field.type !== 'FILE') {
      acc[field.key] = '';
    }
    return acc;
  }, {});
}

function getFieldPlaceholder(field: CareerApplicationField) {
  if (field.type === 'TEXTAREA') return `Enter ${field.label.toLowerCase()}`;
  if (field.type === 'DATE') return '';
  if (field.type === 'NUMBER') return '0';
  return field.label;
}

function isBlank(value: ApplicationValue) {
  return typeof value === 'string' ? value.trim().length === 0 : value === null;
}

function validateField(field: CareerApplicationField, value: ApplicationValue) {
  if (field.required) {
    if (field.type === 'CHECKBOX' && value !== true) {
      return `${field.label} is required`;
    }
    if (field.type === 'FILE' && value === null) {
      return `${field.label} is required`;
    }
    if (field.type !== 'CHECKBOX' && field.type !== 'FILE' && isBlank(value)) {
      return `${field.label} is required`;
    }
  }

  if (field.type === 'NUMBER' && typeof value === 'string' && value.trim()) {
    if (Number.isNaN(Number(value)))
      return `${field.label} must be a valid number`;
  }

  if (field.key === 'email' && typeof value === 'string' && value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return 'Enter a valid email address';
  }

  if (field.type === 'SELECT' && typeof value === 'string' && value.trim()) {
    if (!field.options.includes(value))
      return `Select a valid option for ${field.label}`;
  }

  return null;
}

function serialiseValue(value: ApplicationValue) {
  if (value instanceof File) {
    return {
      name: value.name,
      size: value.size,
      type: value.type,
    };
  }
  return value;
}

export function CareerApplicationForm({ job }: CareerApplicationFormProps) {
  const [values, setValues] = useState<Record<string, ApplicationValue>>(() =>
    getInitialValues(job.applicationFields),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const enabledFields = useMemo(
    () => job.applicationFields,
    [job.applicationFields],
  );

  function setFieldValue(fieldKey: string, value: ApplicationValue) {
    setValues((current) => ({
      ...current,
      [fieldKey]: value,
    }));
    setErrors((current) => {
      if (!current[fieldKey]) return current;
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitApplication();
  }

  async function submitApplication() {
    if (isSubmitting) return;

    const nextErrors = enabledFields.reduce<Record<string, string>>(
      (acc, field) => {
        const error = validateField(field, values[field.key] ?? null);
        if (error) acc[field.key] = error;
        return acc;
      },
      {},
    );

    // Backend requires resumeUrl even if the UI config doesn't.
    const resumeValue = values['RESUME_URL'];
    if (
      resumeValue === null ||
      (typeof resumeValue === 'string' && resumeValue.trim().length === 0)
    ) {
      nextErrors['RESUME_URL'] = 'Resume URL is required';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setIsSubmitted(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const customFieldValues: Record<string, unknown> = {};
    for (const field of enabledFields) {
      if (field.source !== 'custom') continue;
      const value = values[field.key] ?? null;
      customFieldValues[field.key] = serialiseValue(value);
    }

    try {
      await apiClient.post(`/hr/recruitment/jobs/${job.id}/apply`, {
        firstName: String(values['FIRST_NAME'] ?? ''),
        lastName: String(values['LAST_NAME'] ?? ''),
        email: String(values['EMAIL'] ?? ''),
        phone: String(values['PHONE'] ?? '') || null,
        resumeUrl: String(values['RESUME_URL'] ?? ''),
        linkedinUrl: String(values['LINKEDIN_URL'] ?? '') || null,
        portfolioUrl: String(values['PORTFOLIO_URL'] ?? '') || null,
        githubUrl: String(values['GITHUB_URL'] ?? '') || null,
        currentCompany: String(values['CURRENT_COMPANY'] ?? '') || null,
        yearsExperience:
          typeof values['YEARS_OF_EXPERIENCE'] === 'string' &&
          values['YEARS_OF_EXPERIENCE'].trim()
            ? Number(values['YEARS_OF_EXPERIENCE'])
            : null,
        expectedSalary:
          typeof values['EXPECTED_SALARY'] === 'string' &&
          values['EXPECTED_SALARY'].trim()
            ? Number(values['EXPECTED_SALARY'])
            : null,
        coverLetter: String(values['COVER_LETTER'] ?? '') || null,
        customFieldValues:
          Object.keys(customFieldValues).length > 0 ? customFieldValues : null,
      });

      setIsSubmitted(true);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : '';
      setSubmitError(message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[880px] space-y-6 px-4 py-10 md:px-6 md:py-12">
      <section className="space-y-2">
        <Button
          asChild
          variant="ghost"
          className="w-fit px-0 mr-2 text-sm text-primary hover:bg-transparent"
        >
          <Link href="/careers">Back to careers</Link>
        </Button>
        <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {job.requestId}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {job.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {job.location} · {job.employmentTypeLabel} · {job.workModeLabel}
        </p>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-card px-5 py-6">
        {isSubmitted ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-4 py-10 text-center">
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              Application submitted
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              Your application has been received.
            </h2>
            <p className="mt-3 max-w-[480px] text-sm leading-6 text-muted-foreground">
              We have received your application for {job.title}. You can return
              to the careers page to explore other open roles.
            </p>
            <Button asChild className="mt-6">
              <Link href="/careers">Back to see more jobs</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">
                Application Form
              </p>
              <p className="text-sm text-muted-foreground">
                Complete the fields below and submit your application.
              </p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {submitError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {submitError}
                </div>
              ) : null}
              {enabledFields.map((field) => {
                const error = errors[field.key];
                const value = values[field.key] ?? null;

                return (
                  <div key={field.id} className="space-y-2">
                    {field.type === 'CHECKBOX' ? (
                      <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-background px-3 py-3">
                        <input
                          type="checkbox"
                          checked={value === true}
                          onChange={(event) =>
                            setFieldValue(field.key, event.target.checked)
                          }
                          className="mt-1 h-4 w-4 rounded border-border"
                        />
                        <span className="space-y-1">
                          <span className="block text-sm font-medium text-foreground">
                            {field.label}
                            {field.required ? (
                              <span className="ml-1 text-destructive">*</span>
                            ) : null}
                          </span>
                          {field.helpText ? (
                            <span className="block text-xs text-muted-foreground">
                              {field.helpText}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ) : (
                      <>
                        <Label className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required ? (
                            <span className="ml-1 text-destructive">*</span>
                          ) : null}
                        </Label>

                        {field.type === 'TEXTAREA' ? (
                          <Textarea
                            value={typeof value === 'string' ? value : ''}
                            onChange={(event) =>
                              setFieldValue(field.key, event.target.value)
                            }
                            placeholder={getFieldPlaceholder(field)}
                            className="min-h-[140px] rounded-xl border-border bg-background"
                          />
                        ) : null}

                        {field.type === 'SELECT' ? (
                          <Select
                            value={typeof value === 'string' ? value : ''}
                            onValueChange={(nextValue: string) =>
                              setFieldValue(field.key, nextValue)
                            }
                          >
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue
                                placeholder={`Select ${field.label.toLowerCase()}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem
                                  key={`${field.key}-${option}`}
                                  value={option}
                                >
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : null}

                        {field.type === 'FILE' ? (
                          <Input
                            type="file"
                            onChange={(event) =>
                              setFieldValue(
                                field.key,
                                event.target.files?.[0] ?? null,
                              )
                            }
                            className="rounded-xl border-border bg-background"
                          />
                        ) : null}

                        {field.type === 'TEXT' ||
                        field.type === 'NUMBER' ||
                        field.type === 'DATE' ? (
                          <Input
                            type={
                              field.type === 'NUMBER'
                                ? 'number'
                                : field.type === 'DATE'
                                  ? 'date'
                                  : 'text'
                            }
                            value={typeof value === 'string' ? value : ''}
                            onChange={(event) =>
                              setFieldValue(field.key, event.target.value)
                            }
                            placeholder={getFieldPlaceholder(field)}
                            className="rounded-xl border-border bg-background"
                          />
                        ) : null}

                        {field.helpText ? (
                          <p className="text-xs text-muted-foreground">
                            {field.helpText}
                          </p>
                        ) : null}
                      </>
                    )}

                    {error ? (
                      <p className="text-sm text-destructive">{error}</p>
                    ) : null}
                  </div>
                );
              })}

              <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Required fields must be completed before submission.
                </p>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
