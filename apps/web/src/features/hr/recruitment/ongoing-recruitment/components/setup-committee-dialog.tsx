"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { OngoingCommitteePerson } from "@/features/hr/recruitment/ongoing-recruitment/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

type SetupCommitteeDialogProps = {
  jobTitle: string;
  open: boolean;
  people: OngoingCommitteePerson[];
  selectedPeople: OngoingCommitteePerson[];
  onOpenChange: (open: boolean) => void;
  onSave: (members: OngoingCommitteePerson[]) => void;
};

export function SetupCommitteeDialog({
  jobTitle,
  open,
  people,
  selectedPeople,
  onOpenChange,
  onSave,
}: SetupCommitteeDialogProps) {
  const [nextPersonId, setNextPersonId] = useState<string>("");
  const [draftMembers, setDraftMembers] = useState<OngoingCommitteePerson[]>(selectedPeople);

  useEffect(() => {
    if (open) {
      setDraftMembers(selectedPeople);
      setNextPersonId("");
    }
  }, [open, selectedPeople]);

  const availablePeople = useMemo(
    () => people.filter((person) => !draftMembers.some((member) => member.id === person.id)),
    [draftMembers, people],
  );

  function handleAddMember() {
    if (!nextPersonId) return;

    const person = people.find((item) => item.id === nextPersonId);
    if (!person) return;

    setDraftMembers((current) => [...current, person]);
    setNextPersonId("");
  }

  function handleRemoveMember(personId: string) {
    setDraftMembers((current) => current.filter((member) => member.id !== personId));
  }

  function handleSave() {
    onSave(draftMembers);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Setup Committees</DialogTitle>
          <DialogDescription>{jobTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-black">People</p>
              <Select value={nextPersonId} onValueChange={setNextPersonId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="button" variant="outline" onClick={handleAddMember} disabled={!nextPersonId}>
              Add
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-black">Selected People</p>
            {draftMembers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {draftMembers.map((member) => (
                  <Badge
                    key={member.id}
                    variant="outline"
                    className="flex h-auto items-center gap-2 rounded-md border-[#e5e5e5] px-3 py-1.5 text-xs font-medium text-black"
                  >
                    <span>{member.fullName}</span>
                    <button
                      type="button"
                      className="text-[#666] transition-colors hover:text-black"
                      onClick={() => handleRemoveMember(member.id)}
                      aria-label={`Remove ${member.fullName}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#666]">No committee members selected.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
