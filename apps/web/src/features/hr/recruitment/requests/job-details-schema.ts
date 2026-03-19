import { z } from "zod";

export const experienceLevelValues = ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD", "PRINCIPAL"] as const;
export type ExperienceLevel = (typeof experienceLevelValues)[number];

export const contractTypeValues = ["PERMANENT", "CONTRACT", "INTERNSHIP", "FREELANCE"] as const;
export type ContractType = (typeof contractTypeValues)[number];

export const salaryModeValues = ["NOT_SPECIFIED", "FIXED", "NEGOTIABLE", "COMPETITIVE"] as const;
export type SalaryMode = (typeof salaryModeValues)[number];

export const jobDetailsFormSchema = z
  .object({
    title: z.string().trim().min(1, "Job title is required"),
    city: z.string().trim().min(1, "City is required"),
    country: z.string().trim().optional(),
    workLocationType: z.enum(["ON_SITE", "HYBRID", "REMOTE"], {
      error: () => "Work mode is required",
    }),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "TEMPORARY"], {
      error: () => "Employment type is required",
    }),
    description: z
      .string()
      .trim()
      .min(40, "Job description must be at least 40 characters"),
    summary: z.string().trim().optional(),
    responsibilities: z.string().trim().min(1, "Key responsibilities are required"),
    requiredSkills: z.string().trim().optional(),
    preferredSkills: z.string().trim().optional(),
    experienceLevel: z.enum(experienceLevelValues, {
      error: () => "Experience level is required",
    }),
    contractType: z.enum(contractTypeValues, {
      error: () => "Contract type is required",
    }),
    salaryMode: z.enum(salaryModeValues, {
      error: () => "Salary type is required",
    }),
    salaryMin: z.string().trim().optional(),
    salaryMax: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    benefits: z.string().trim().optional(),
    tools: z.string().trim().optional(),
    hiringManagerId: z.string().trim().optional(),
    applicationDeadline: z.string().trim().optional(),
    openings: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.salaryMode === "FIXED") {
      if (!values.salaryMin?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryMin"],
          message: "Salary amount is required for fixed salary",
        });
      }
      if (!values.currency?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currency"],
          message: "Salary currency is required for fixed salary",
        });
      }
    }

    if (values.salaryMode === "NEGOTIABLE" || values.salaryMode === "COMPETITIVE") {
      if (!values.salaryMin?.trim() && !values.salaryMax?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryMin"],
          message: "At least one salary value is required",
        });
      }
      if (!values.currency?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currency"],
          message: "Salary currency is required",
        });
      }
    }

    if (values.salaryMin?.trim() && values.salaryMax?.trim()) {
      const min = Number(values.salaryMin);
      const max = Number(values.salaryMax);
      if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryMax"],
          message: "Maximum salary must be greater than or equal to minimum salary",
        });
      }
    }
  });

export type JobDetailsFormValues = z.infer<typeof jobDetailsFormSchema>;