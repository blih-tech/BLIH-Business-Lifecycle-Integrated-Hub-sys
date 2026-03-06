'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type {
  FullJobRequest,
  JobRequestDepartment,
} from '@/features/hr/recruitment/requests/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

type JobRequestJustifyDialogProps = {
  request: FullJobRequest | null;
  requestId: string | null;
  onOpenChange: (isOpen: boolean) => void;
};

const justifySchema = z.object({
  justification: z
    .string()
    .trim()
    .min(20, 'Justification must be at least 20 characters'),
  action: z.enum(['reject', 'review'], {
    error: () => 'Please select an action',
  }),
});

type JustifyFormValues = z.infer<typeof justifySchema>;

function departmentLabel(department: JobRequestDepartment) {
  if (department === 'technical') return 'TECHNICAL DEPT.';
  if (department === 'creative') return 'CREATIVE DEPT.';
  return 'DIGITAL MARKETING DEPT.';
}

export function JobRequestJustifyDialog({
  request,
  requestId,
  onOpenChange,
}: JobRequestJustifyDialogProps) {
  const form = useForm<JustifyFormValues>({
    resolver: zodResolver(justifySchema),
    mode: 'onChange',
    defaultValues: {
      justification: '',
      action: undefined,
    },
  });

  useEffect(() => {
    if (!request) {
      form.reset({
        justification: '',
        action: undefined,
      });
    }
  }, [form, request]);

  function closeDialog() {
    onOpenChange(false);
  }

  function handleSubmit(values: JustifyFormValues) {
    if (!request || !requestId) return;

    const payload = {
      requestId,
      action: values.action,
      justification: values.justification,
    };

    console.log('jobRequestJustification', payload);
    closeDialog();
  }

  return (
    <Dialog open={request !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] p-0 sm:max-w-[640px]">
        {request ? (
          <>
            <DialogHeader className="border-b border-border p-4">
              <DialogTitle className="ui-section-title text-foreground">
                Justify Decision
              </DialogTitle>
              <DialogDescription className="ui-body text-muted-foreground">
                Add a clear reason and choose the next step for this request.
              </DialogDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  {request.jobDetailsForm.jobTitle}
                </span>
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {departmentLabel(request.requestForm.department as JobRequestDepartment)}
                </span>
                {requestId ? (
                  <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {requestId}
                  </span>
                ) : null}
              </div>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-0"
              >
                <div className="space-y-5 p-4">
                  <div className="grid gap-5">
                    <FormField
                      control={form.control}
                      name="action"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ui-meta text-muted-foreground">
                            Action
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full rounded-[6px] bg-background">
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="reject">Reject</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            Choose whether to reject the request or send it back for review.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="justification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ui-meta text-muted-foreground">
                            Justification
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Explain the decision and what the requester should do next."
                              className="min-h-[180px] rounded-[10px] border-border bg-background"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Keep it clear and actionable for the requester.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter className="border-t border-border p-4">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={closeDialog}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="cursor-pointer"
                    disabled={!form.formState.isValid}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
