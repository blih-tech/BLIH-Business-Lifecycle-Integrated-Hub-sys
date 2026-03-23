import { z } from 'zod';

export const applicationFieldTypeValues = [
  'text',
  'textarea',
  'number',
  'select',
  'file',
  'date',
  'checkbox',
] as const;

export const applicationFieldTypeSchema = z.enum(applicationFieldTypeValues, {
  error: () => 'Field type is required',
});

export const predefinedApplicationFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: applicationFieldTypeSchema,
  enabled: z.boolean(),
  required: z.boolean(),
});

export const customApplicationFieldSchema = z.object({
  id: z.string(),
  label: z.string().trim().min(1, 'Field label is required'),
  type: applicationFieldTypeSchema,
  required: z.boolean(),
  helpText: z.string().trim().optional(),
  options: z.array(z.string().trim()),
});

export const applicationFormSchema = z
  .object({
    predefinedFields: z.array(predefinedApplicationFieldSchema),
    customFields: z.array(customApplicationFieldSchema),
  })
  .superRefine((values, ctx) => {
    const enabledPredefinedCount = values.predefinedFields.filter(
      (field) => field.enabled,
    ).length;
    const customFieldCount = values.customFields.length;

    if (enabledPredefinedCount + customFieldCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['predefinedFields'],
        message: 'Add at least one field to the application form',
      });
    }

    values.customFields.forEach((field, index) => {
      if (field.type === 'select') {
        const options = field.options
          .map((option) => option.trim())
          .filter(Boolean);

        if (options.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customFields', index, 'options'],
            message: 'Add at least one option for select fields',
          });
        }
      }
    });
  });

export type ApplicationFieldType = z.infer<typeof applicationFieldTypeSchema>;
export type PredefinedApplicationField = z.infer<
  typeof predefinedApplicationFieldSchema
>;
export type CustomApplicationField = z.infer<
  typeof customApplicationFieldSchema
>;
export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
