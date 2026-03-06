import { z } from "zod";

const salaryFieldMessage = "Complete salary range and currency or leave all salary fields empty";

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
    jobSummary: z.string().trim().min(40, "Job summary must be at least 40 characters"),
    whyJoinUs: z.string().trim().optional(),
    keyResponsibilities: z.string().trim().min(1, "Key responsibilities are required"),
    requiredSkills: z.string().trim().min(1, "Required skills are required"),
    preferredSkills: z.string().trim().optional(),
    experienceLevel: z.enum(["entry", "mid", "senior", "lead"], {
      error: () => "Experience level is required",
    }),
    salaryRangeMin: z.string().trim().optional(),
    salaryRangeMax: z.string().trim().optional(),
    salaryCurrency: z.string().trim().optional(),
    benefits: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    const hasSalaryValue = Boolean(
      values.salaryRangeMin?.trim() || values.salaryRangeMax?.trim() || values.salaryCurrency?.trim(),
    );

    if (hasSalaryValue) {
      if (!values.salaryRangeMin?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryRangeMin"],
          message: salaryFieldMessage,
        });
      }
      if (!values.salaryRangeMax?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryRangeMax"],
          message: salaryFieldMessage,
        });
      }
      if (!values.salaryCurrency?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salaryCurrency"],
          message: salaryFieldMessage,
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
