'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import {
  useCreatePosition,
  type PositionOption,
} from '@/hooks/hr/use-reference-data';
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
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

type CreatePositionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId?: string;
  departmentName?: string;
  onCreated: (position: PositionOption) => void;
};

export function CreatePositionDialog({
  open,
  onOpenChange,
  departmentId,
  departmentName: initialDepartmentName,
  onCreated,
}: CreatePositionDialogProps) {
  const createPosition = useCreatePosition();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentName, setDepartmentName] = useState(
    initialDepartmentName || '',
  );

  function resetForm() {
    setTitle('');
    setDescription('');
    setDepartmentName(initialDepartmentName || '');
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Position title is required.');
      return;
    }

    const trimmedDeptName = departmentName.trim();
    if (!departmentId && !trimmedDeptName) {
      toast.error('Department is required.');
      return;
    }

    try {
      const position = await createPosition.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || undefined,
        departmentId: departmentId,
        departmentName: departmentId ? undefined : trimmedDeptName,
        isActive: true,
      });
      toast.success('Position created successfully.');
      onCreated(position);
      handleOpenChange(false);
    } catch (error) {
      console.error('Failed to create position', error);
      toast.error('Failed to create position.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add position</DialogTitle>
          <DialogDescription>
            {departmentId
              ? `Create a position in ${initialDepartmentName} for job requests and employee records.`
              : 'Create a position and associate it with a department.'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!departmentId && (
            <div className="space-y-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                placeholder="Engineering"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position-title">Title</Label>
            <Input
              id="position-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Senior Backend Engineer"
              autoFocus={!!departmentId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-description">Description (optional)</Label>
            <Textarea
              id="position-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Role scope and responsibilities"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createPosition.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPosition.isPending}>
              {createPosition.isPending ? 'Creating…' : 'Create position'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
