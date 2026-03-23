'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  useFieldArray,
  useWatch,
  type Control,
  type UseFormReturn,
} from 'react-hook-form';

import type {
  ApplicationFieldType,
  ApplicationFormValues,
  CustomApplicationField,
} from '@/features/hr/recruitment/requests/application-form-schema';
import {
  FormControl,
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
import { Button } from '@/shared/components/ui/button';

type ApplicationFormStepProps = {
  form: UseFormReturn<ApplicationFormValues>;
};

type FormSectionCardProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
};

type PreviewField = {
  previewId: string;
  label: string;
  type: ApplicationFieldType;
  required: boolean;
  helpText?: string;
  options?: string[];
};

const fieldTypeOptions: Array<{ value: ApplicationFieldType; label: string }> =
  [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Select' },
    { value: 'file', label: 'File Upload' },
    { value: 'date', label: 'Date' },
    { value: 'checkbox', label: 'Checkbox' },
  ];

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

function typeLabel(type: ApplicationFieldType) {
  return (
    fieldTypeOptions.find((option) => option.value === type)?.label ?? type
  );
}

function defaultCustomField(): CustomApplicationField {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: '',
    type: 'text',
    required: false,
    helpText: '',
    options: [],
  };
}

function PreviewInput({ type }: { type: ApplicationFieldType }) {
  if (type === 'textarea') {
    return (
      <div className="mt-2 h-20 rounded-[10px] border border-border bg-muted/60" />
    );
  }

  if (type === 'checkbox') {
    return (
      <div className="mt-2 flex items-center gap-2">
        <div className="h-4 w-4 rounded border border-border bg-background" />
        <div className="h-3 w-24 rounded bg-muted/80" />
      </div>
    );
  }

  return (
    <div className="mt-2 h-9 rounded-[10px] border border-border bg-muted/60" />
  );
}

function CustomFieldOptionsEditor({
  control,
  fieldIndex,
}: {
  control: Control<ApplicationFormValues>;
  fieldIndex: number;
}) {
  return (
    <div className="space-y-2">
      <FormField
        control={control}
        name={`customFields.${fieldIndex}.options`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="ui-meta text-muted-foreground">
              Options
            </FormLabel>
            <FormControl>
              <textarea
                value={field.value.join('\n')}
                onChange={(event) =>
                  field.onChange(
                    event.target.value
                      .split('\n')
                      .map((option) => option.trim()),
                  )
                }
                placeholder={'Yes\nNo\nMaybe'}
                className="min-h-[120px] w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Add one option per line.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function CustomFieldCard({
  index,
  control,
  onRemove,
}: {
  index: number;
  control: Control<ApplicationFormValues>;
  onRemove: () => void;
}) {
  const fieldType = useWatch({
    control,
    name: `customFields.${index}.type`,
  });

  return (
    <div className="rounded-[14px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.92))] p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Custom Field {index + 1}
          </p>
          <p className="text-xs text-muted-foreground">
            Add a question for applicants.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="cursor-pointer"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <FormField
          control={control}
          name={`customFields.${index}.label`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ui-meta text-muted-foreground">
                Label
              </FormLabel>
              <FormControl>
                <Input placeholder="Visa sponsorship status" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`customFields.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ui-meta text-muted-foreground">
                Field Type
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={(value: string) => {
                  field.onChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fieldTypeOptions.map((option) => (
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
          control={control}
          name={`customFields.${index}.required`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ui-meta text-muted-foreground">
                Required
              </FormLabel>
              <FormControl>
                <Button
                  type="button"
                  variant={field.value ? 'default' : 'outline'}
                  className="w-full cursor-pointer justify-start"
                  onClick={() => field.onChange(!field.value)}
                >
                  {field.value ? 'Required' : 'Optional'}
                </Button>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`customFields.${index}.helpText`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ui-meta text-muted-foreground">
                Help Text
              </FormLabel>
              <FormControl>
                <Input placeholder="Shown below the field" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {fieldType === 'select' ? (
        <div className="mt-4 border-t border-border/70 pt-4">
          <CustomFieldOptionsEditor control={control} fieldIndex={index} />
        </div>
      ) : null}
    </div>
  );
}

export function ApplicationFormStep({ form }: ApplicationFormStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customFields',
  });

  const [predefinedFields, customFields] = useWatch({
    control: form.control,
    name: ['predefinedFields', 'customFields'],
  });

  const enabledPredefinedFields = (predefinedFields ?? []).filter(
    (field) => field.enabled,
  );
  const previewFields: PreviewField[] = [
    ...enabledPredefinedFields.map((field) => ({
      previewId: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
    })),
    ...((customFields ?? []).map((field) => ({
      previewId: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      helpText: field.helpText,
      options: field.options,
    })) ?? []),
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <div className="space-y-4">
          <FormSectionCard
            eyebrow="Standard"
            title="Predefined Fields"
            description="Turn standard applicant fields on or off."
          >
            <div className="space-y-3">
              {predefinedFields?.map((field, index) => (
                <div
                  key={field.key}
                  className="rounded-[14px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.92))] p-3.5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {field.label}
                        </p>
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {typeLabel(field.type)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <FormField
                        control={form.control}
                        name={`predefinedFields.${index}.enabled`}
                        render={({ field: enabledField }) => (
                          <FormItem>
                            <FormControl>
                              <Button
                                type="button"
                                variant={
                                  enabledField.value ? 'default' : 'outline'
                                }
                                size="sm"
                                className="cursor-pointer"
                                onClick={() =>
                                  enabledField.onChange(!enabledField.value)
                                }
                              >
                                {enabledField.value ? 'Included' : 'Add Field'}
                              </Button>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`predefinedFields.${index}.required`}
                        render={({ field: requiredField }) => (
                          <FormItem>
                            <FormControl>
                              <Button
                                type="button"
                                variant={
                                  requiredField.value ? 'default' : 'outline'
                                }
                                size="sm"
                                className="cursor-pointer"
                                disabled={!predefinedFields[index]?.enabled}
                                onClick={() =>
                                  requiredField.onChange(!requiredField.value)
                                }
                              >
                                {requiredField.value ? 'Required' : 'Optional'}
                              </Button>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <FormField
              control={form.control}
              name="predefinedFields"
              render={() => <FormMessage />}
            />
          </FormSectionCard>

          <FormSectionCard
            eyebrow="Custom"
            title="Custom Fields"
            description="Add custom questions for this role."
          >
            <div className="space-y-3">
              {fields.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                  No custom fields yet.
                </div>
              ) : null}

              {fields.map((field, index) => (
                <CustomFieldCard
                  key={field.id}
                  index={index}
                  control={form.control}
                  onRemove={() => remove(index)}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => append(defaultCustomField())}
              >
                <Plus className="h-4 w-4" />
                Add Custom Field
              </Button>
            </div>
          </FormSectionCard>
        </div>

        <div className="space-y-4">
          <FormSectionCard
            eyebrow="Preview"
            title="Application Preview"
            description="This is how the form will be structured for applicants."
          >
            <div className="rounded-[16px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,250,251,0.96))] p-4">
              <div className="border-b border-border/70 pb-3">
                <p className="text-base font-semibold tracking-[-0.02em] text-foreground">
                  Apply for this role
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Review the applicant-facing form fields.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {previewFields.length === 0 ? (
                  <div className="rounded-[12px] border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                    Add at least one field to preview the application form.
                  </div>
                ) : null}

                {previewFields.map((field) => (
                  <div
                    key={field.previewId}
                    className="rounded-[12px] border border-border bg-background px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        {field.label}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {typeLabel(field.type)}
                        </span>
                        {field.required ? (
                          <span className="rounded-full border border-primary/30 bg-[rgba(30,102,247,0.08)] px-2 py-0.5 text-[11px] text-primary">
                            Required
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {field.helpText ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {field.helpText}
                      </p>
                    ) : null}
                    <PreviewInput type={field.type} />
                    {field.type === 'select' &&
                    field.options &&
                    field.options.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {field.options
                          .map((option: string) => option.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((option: string) => (
                            <span
                              key={option}
                              className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {option}
                            </span>
                          ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </FormSectionCard>
        </div>
      </div>
    </div>
  );
}
