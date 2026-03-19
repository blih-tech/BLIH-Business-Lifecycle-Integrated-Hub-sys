'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/components/ui/form';
import { Textarea } from '@/shared/components/ui/textarea';

type JobRequestJustifyDialogProps = {
  request: FullJobRequest | null;
  requestId: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (action: "review" | "reject", justification: string) => Promise<void>;
  submittingAction?: "review" | "reject" | null;
};

const justifySchema = z.object({
  justification: z
    .string()
    .trim()
    .min(20, 'Justification must be at least 20 characters'),
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
  onSubmit,
  submittingAction = null,
}: JobRequestJustifyDialogProps) {
  const form = useForm<JustifyFormValues>({
    resolver: zodResolver(justifySchema),
    mode: 'onChange',
    defaultValues: {
      justification: '',
    },
  });

  useEffect(() => {
    if (!request) {
      form.reset({
        justification: '',
      });
    }
  }, [form, request]);

  function closeDialog() {
    onOpenChange(false);
  }

  function handleSubmit(action: "review" | "reject") {
    return async (values: JustifyFormValues) => {
      if (!request || !requestId) return;
      await onSubmit(action, values.justification);
      closeDialog();
    };
  }

  return (
    <Dialog open={request !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] rounded-[12px] border border-[#e5e5e5] bg-white p-0 sm:max-w-[640px]">
        {request ? (
          <>
            <DialogHeader className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <DialogTitle className="text-[18px] font-semibold tracking-[-0.4px] text-black">
                      {request.jobDetailsForm.title}
                    </DialogTitle>
                    <span className="inline-flex h-[22px] items-center justify-center rounded-[4px] border border-[#1e66f7] px-[9px] py-[3px] text-[12px] font-medium leading-[16px] text-[#1e66f7]">
                      {request.jobDetailsForm.experienceLevel
                        .split('_')
                        .map((value) => value[0]?.toUpperCase() + value.slice(1))
                        .join(' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-[14px] leading-[20px] tracking-[-0.2px] text-[#666]">
                    <span className="inline-flex items-center rounded-[4px] bg-[#e9f0fe] px-[4px] py-[2px] text-[12px] font-semibold uppercase leading-[16px] text-[#1e66f7]">
                      {departmentLabel(
                        request.requestForm.department as JobRequestDepartment,
                      )}
                    </span>
                    <span>
                      {request.jobDetailsForm.employmentType === 'FULL_TIME'
                        ? 'Full-time'
                        : request.jobDetailsForm.employmentType === 'PART_TIME'
                          ? 'Part-time'
                          : request.jobDetailsForm.employmentType === 'CONTRACT'
                            ? 'Contract'
                            : 'Intern'}
                    </span>
                    <span>
                      {request.requestForm.openings
                        ? `${request.requestForm.openings} Position${request.requestForm.openings === '1' ? '' : 's'}`
                        : '1 Position'}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit('review'))}
                className="space-y-0"
              >
                <div className="border-t border-[#e5e5e5]" />
                <div className="space-y-6 p-6">
                  <div className="flex items-center gap-2 text-[12px] text-[#666]">
                    <ChevronLeft className="h-4 w-4 text-[#1e66f7]" />
                    <DialogClose asChild>
                      <button
                        type="button"
                        className="text-[12px] text-[#666]"
                        onClick={closeDialog}
                      >
                        Back
                      </button>
                    </DialogClose>
                  </div>

                  <div className="space-y-2">
                    <DialogDescription className="text-center text-[16px] font-semibold tracking-[-0.4px] text-black">
                      Write Your Reasons
                    </DialogDescription>
                    <FormField
                      control={form.control}
                      name="justification"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="rounded-[6px] border border-[#e5e5e5] p-[13px]">
                              <Textarea
                                {...field}
                                placeholder="Your justification to make a revision or decline..."
                                className="min-h-[211px] resize-none border-0 bg-[#f8f8f8]/60 p-3 text-[12px] text-[#6b7280] shadow-none focus-visible:ring-0"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="submit"
                      className="h-[32px] rounded-[6px] bg-[#1e66f7] px-[16px] py-[6px] text-[14px] font-medium leading-[20px] tracking-[-0.2px] text-white hover:bg-[#1e66f7]"
                      disabled={!form.formState.isValid || !!submittingAction}
                    >
                      {submittingAction === "review" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Revise"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-[32px] rounded-[6px] border-[#e5e5e5] px-[16px] py-[6px] text-[14px] font-medium leading-[20px] tracking-[-0.2px] text-black hover:bg-white"
                      onClick={form.handleSubmit(handleSubmit('reject'))}
                      disabled={!form.formState.isValid || !!submittingAction}
                    >
                      {submittingAction === "reject" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Decline"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
