import { z } from "zod";

const today = new Date();
const currentDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  .toISOString()
  .slice(0, 10);

export const createRequestFormSchema = z
  .object({
    jobTitle: z.string().trim().min(1, "Job title is required"),
    department: z.string().trim().min(1, "Department is required"),
    requestedBy: z.string().trim().min(1, "Requested by is required"),
    position: z.string().trim().min(1, "Position is required"),
    requestType: z.enum(["new", "replacement"], {
      error: () => "Please select whether this is a new role or replacement",
    }),
    replaceFor: z.string().trim().optional(),
    businessJustification: z
      .string()
      .trim()
      .min(20, "Business justification must be at least 20 characters"),
    openings: z.string().trim().optional(),
    createdDate: z.string().trim().optional(),
    employmentType: z.enum(["full_time", "part_time", "contract", "intern"], {
      error: () => "Employment type is required",
    }),
    workMode: z.enum(["on_site", "hybrid", "remote"], {
      error: () => "Work mode is required",
    }),
    urgency: z.enum(["high", "medium", "low"], {
      error: () => "Urgency is required",
    }),
    neededByDate: z
      .string()
      .min(1, "Needed by date is required")
      .refine((value) => value >= currentDate, {
        message: "Needed by date cannot be in the past",
      }),
  })
  .superRefine((values, ctx) => {
    if (values.requestType === "replacement" && !values.replaceFor?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["replaceFor"],
        message: "Please specify who this role is replacing",
      });
    }
  });

export type CreateRequestFormValues = z.infer<typeof createRequestFormSchema>;
