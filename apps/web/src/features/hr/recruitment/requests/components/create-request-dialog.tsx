"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type CreateRequestDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function CreateRequestDialog({ open, onOpenChange }: CreateRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] p-0 sm:max-w-[560px]">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle className="ui-section-title text-foreground">Create New Request</DialogTitle>
          <DialogDescription className="ui-body text-muted-foreground">
            Coming soon
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t border-border p-4">
          <Button type="button" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
