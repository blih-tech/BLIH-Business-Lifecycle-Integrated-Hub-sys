import { z } from "zod";

const today = new Date();
const currentDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  .toISOString()
  .slice(0, 10);

export const requestTypeValues = ["NEW", "REPLACEMENT"] as const;
export type RequestType = (typeof requestTypeValues)[number];

export const employmentTypeValues = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "TEMPORARY"] as const;
export type EmploymentType = (typeof employmentTypeValues)[number];

export const workModeValues = ["ON_SITE", "HYBRID", "REMOTE"] as const;
export type WorkMode = (typeof workModeValues)[number];

export const urgencyValues = ["HIGH", "MEDIUM", "LOW"] as const;
export type Urgency = (typeof urgencyValues)[number];

export const priorityValues = ["HIGH", "MEDIUM", "LOW"] as const;
export type Priority = (typeof priorityValues)[number];

export const createRequestFormSchema = z
  .object({
    jobTitle: z.string().trim().min(1, "Job title is required"),
    department: z.string().trim().min(1, "Department is required"),
    requestedBy: z.string().trim().optional(),
    position: z.string().trim().min(1, "Position is required"),
    requestType: z.enum(requestTypeValues, {
      error: () => "Please select whether this is a new role or replacement",
    }),
    replaceFor: z.string().trim().optional(),
    businessJustification: z
      .string()
      .trim()
      .min(20, "Business justification must be at least 20 characters"),
    employmentType: z.enum(employmentTypeValues, {
      error: () => "Employment type is required",
    }),
    workMode: z.enum(workModeValues, {
      error: () => "Work mode is required",
    }),
    urgency: z.enum(urgencyValues, {
      error: () => "Urgency is required",
    }),
    neededByDate: z
      .string()
      .min(1, "Needed by date is required")
      .refine((value) => value >= currentDate, {
        message: "Needed by date cannot be in the past",
      }),
    priority: z.enum(priorityValues).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.requestType === "REPLACEMENT" && !values.replaceFor?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["replaceFor"],
        message: "Please specify who this role is replacing",
      });
    }
  });

export type CreateRequestFormValues = z.infer<typeof createRequestFormSchema>;