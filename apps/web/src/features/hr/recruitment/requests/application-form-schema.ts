import { z } from "zod";

export const applicationFieldTypeValues = ["TEXT", "TEXTAREA", "NUMBER", "SELECT", "FILE", "DATE", "CHECKBOX"] as const;
export type ApplicationFieldType = (typeof applicationFieldTypeValues)[number];

export const applicantOptionalFieldKeyValues = [
  "FIRST_NAME",
  "LAST_NAME",
  "EMAIL",
  "PHONE",
  "RESUME_URL",
  "LINKEDIN_URL",
  "PORTFOLIO_URL",
  "GITHUB_URL",
  "CURRENT_COMPANY",
  "YEARS_OF_EXPERIENCE",
  "EXPECTED_SALARY",
  "COVER_LETTER",
] as const;
export type ApplicantOptionalFieldKey = (typeof applicantOptionalFieldKeyValues)[number];

export const applicationFormSectionKeyValues = ["EDUCATION", "EXPERIENCE"] as const;
export type ApplicationFormSectionKey = (typeof applicationFormSectionKeyValues)[number];

export const applicantFieldSchema = z.object({
  key: z.enum(applicantOptionalFieldKeyValues),
  enabled: z.boolean(),
  required: z.boolean(),
  order: z.number().optional(),
});

export const applicationFormSectionSchema = z.object({
  key: z.enum(applicationFormSectionKeyValues),
  enabled: z.boolean(),
  required: z.boolean(),
  order: z.number().optional(),
});

export const customApplicationFieldSchema = z.object({
  id: z.string(),
  label: z.string().trim().min(1, "Field label is required"),
  type: z.enum(applicationFieldTypeValues, {
    error: () => "Field type is required",
  }),
  required: z.boolean(),
  helpText: z.string().trim().optional(),
  options: z.array(z.string().trim()),
});

export const applicationFormSchema = z.object({
  applicantFields: z.array(applicantFieldSchema),
  sections: z.array(applicationFormSectionSchema),
  customFields: z.array(customApplicationFieldSchema),
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
export type CustomApplicationField = z.infer<typeof customApplicationFieldSchema>;
export const PredefinedApplicationField = applicantFieldSchema;