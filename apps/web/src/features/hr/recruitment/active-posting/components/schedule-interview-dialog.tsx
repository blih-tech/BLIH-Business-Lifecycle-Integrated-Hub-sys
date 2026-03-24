'use client';

import { useEffect, useState } from 'react';

import type { ActiveJobItem } from '@/features/hr/recruitment/active-posting/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';

type ScheduleInterviewDialogProps = {
  open: boolean;
  applicants: ActiveJobItem['applicants'];
  onOpenChange: (open: boolean) => void;
  onProceed: (payload: {
    applicantIds: string[];
    date: string;
    time: string;
  }) => void;
};

export function ScheduleInterviewDialog({
  open,
  applicants,
  onOpenChange,
  onProceed,
}: ScheduleInterviewDialogProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (open) {
      setDate('');
      setTime('');
    }
  }, [open]);

  function handleProceed() {
    if (!date || !time || applicants.length === 0) return;

    onProceed({
      applicantIds: applicants.map((applicant) => applicant.id),
      date,
      time,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            {applicants.length} applicant{applicants.length === 1 ? '' : 's'}{' '}
            selected
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {applicants.map((applicant) => (
              <span
                key={applicant.id}
                className="inline-flex rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-xs font-medium text-black"
              >
                {applicant.fullName}
              </span>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-black">Date</p>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-black">Time</p>
              <Input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleProceed}
            disabled={!date || !time || applicants.length === 0}
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
