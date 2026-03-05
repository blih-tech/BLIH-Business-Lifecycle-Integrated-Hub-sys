'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type {
  JobRequestDepartment,
  JobRequestItem,
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
  request: JobRequestItem | null;
  onOpenChange: (isOpen: boolean) => void;
};

const justifySchema = z.object({
  justification: z.string().trim().min(1, 'Justification is required'),
  nextStep: z.enum(['decline', 'request_revision'], {
    error: () => 'Please select the next step',
  }),
});

type JustifyFormValues = z.infer<typeof justifySchema>;

function departmentLabel(department: JobRequestDepartment) {
  if (department === 'technical') return 'TECHNICAL DEPT.';
  if (department === 'creative') return 'CREATIVE DEPT.';
  return 'DIGITAL MARKETING DEPT.';
}

function requestIdLabel(id: string) {
  return id.toUpperCase().replace('JR-', 'REQ-');
}

export function JobRequestJustifyDialog({
  request,
  onOpenChange,
}: JobRequestJustifyDialogProps) {
  const form = useForm<JustifyFormValues>({
    resolver: zodResolver(justifySchema),
    mode: 'onChange',
    defaultValues: {
      justification: '',
      nextStep: undefined,
    },
  });

  useEffect(() => {
    if (!request) {
      form.reset({
        justification: '',
        nextStep: undefined,
      });
    }
  }, [form, request]);

  function closeDialog() {
    onOpenChange(false);
  }

  function handleSubmit() {
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
                  {request.title}
                </span>
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {departmentLabel(request.department)}
                </span>
                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {requestIdLabel(request.id)}
                </span>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-0"
              >
                <div className="space-y-4 p-4">
                  <section className="ui-surface p-3.5">
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
                              placeholder="Explain why this request should be declined or sent for revision..."
                              className="max-h-[180px] rounded-[6px] border-border bg-background"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Keep this clear and actionable for the requesting
                            manager.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </section>

                  <section className="ui-surface p-3.5">
                    <FormField
                      control={form.control}
                      name="nextStep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ui-meta text-muted-foreground">
                            Next Step
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full rounded-[6px] bg-background">
                                <SelectValue placeholder="Select next step" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="decline">Decline</SelectItem>
                              <SelectItem value="request_revision">
                                Request Revision
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            Decline closes this request. Request Revision sends
                            it back for updates.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </section>
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
