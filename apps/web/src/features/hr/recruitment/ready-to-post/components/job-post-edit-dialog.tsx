"use client";

import type { JobPostItem } from "@/features/hr/recruitment/ready-to-post/types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type JobPostEditDialogProps = {
  item: JobPostItem | null;
  onOpenChange: (isOpen: boolean) => void;
};

export function JobPostEditDialog({ item, onOpenChange }: JobPostEditDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] p-0 sm:max-w-[640px]">
        {item ? (
          <>
            <DialogHeader className="border-b border-border p-4">
              <DialogTitle className="ui-section-title text-foreground">
                Edit {item.title}
              </DialogTitle>
              <DialogDescription className="ui-body text-muted-foreground">
                Coming soon
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="border-t border-border p-4">
              <Button type="button" className="cursor-pointer" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
