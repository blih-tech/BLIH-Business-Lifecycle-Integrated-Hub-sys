import { z } from "zod";

export const salaryModeValues = ["not_specified", "fixed", "range", "negotiable", "competitive"] as const;

function toVisibleText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const jobDetailsFormSchema = z
  .object({
    jobTitle: z.string().trim().min(1, "Job title is required"),
    location: z.string().trim().min(1, "Location is required"),
    workMode: z.enum(["on_site", "hybrid", "remote"], {
      error: () => "Work mode is required",
    }),
    employmentType: z.enum(["full_time", "part_time", "contract", "intern"], {
      error: () => "Employment type is required",
    }),
    jobSummary: z
      .string()
      .trim()
      .refine((value) => toVisibleText(value).length >= 40, "Job summary must be at least 40 characters"),
    whyJoinUs: z.string().trim().optional(),
    keyResponsibilities: z.string().trim().min(1, "Key responsibilities are required"),
    requirements: z.string().trim().min(1, "Requirements are required"),
    preferredSkills: z.string().trim().optional(),
    experienceLevel: z.enum(["entry", "mid", "senior", "lead"], {
      error: () => "Experience level is required",
    }),
    salaryMode: z.enum(salaryModeValues, {
      error: () => "Salary type is required",
    }),
    salaryRangeMin: z.string().trim().optional(),
    salaryRangeMax: z.string().trim().optional(),
    salaryCurrency: z.string().trim().optional(),
    benefits: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.salaryMode === "fixed" || values.salaryMode === "range") {
      if (!values.salaryRangeMin?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryRangeMin"],
          message:
            values.salaryMode === "fixed"
              ? "Salary amount is required for fixed salary"
              : "Minimum salary is required for salary range",
        });
      }
      if (values.salaryMode === "range" && !values.salaryRangeMax?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryRangeMax"],
          message: "Maximum salary is required for salary range",
        });
      }
      if (!values.salaryCurrency?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryCurrency"],
          message:
            values.salaryMode === "fixed"
              ? "Salary currency is required for fixed salary"
              : "Salary currency is required for salary range",
        });
      }
    }

    const min = Number(values.salaryRangeMin);
    const max = Number(values.salaryRangeMax);

    if (
      values.salaryRangeMin?.trim() &&
      values.salaryRangeMax?.trim() &&
      !Number.isNaN(min) &&
      !Number.isNaN(max) &&
      max < min
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salaryRangeMax"],
        message: "Maximum salary must be greater than or equal to minimum salary",
      });
    }
  });

export type JobDetailsFormValues = z.infer<typeof jobDetailsFormSchema>;
