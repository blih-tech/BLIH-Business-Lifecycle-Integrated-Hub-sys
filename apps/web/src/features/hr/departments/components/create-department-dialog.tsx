'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import {
  useCreateDepartment,
  type DepartmentOption,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

type CreateDepartmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentOptions: ReadonlyArray<{ value: string; label: string }>;
  onCreated: (department: DepartmentOption) => void;
};

export function CreateDepartmentDialog({
  open,
  onOpenChange,
  parentOptions,
  onCreated,
}: CreateDepartmentDialogProps) {
  const createDepartment = useCreateDepartment();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');

  function resetForm() {
    setName('');
    setDescription('');
    setParentId('');
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Department name is required.');
      return;
    }

    try {
      const department = await createDepartment.mutateAsync({
        name: trimmedName,
        description: description.trim() || null,
        parentId: parentId || null,
      });
      toast.success('Department created successfully.');
      onCreated(department);
      handleOpenChange(false);
    } catch (error) {
      console.error('Failed to create department', error);
      toast.error('Failed to create department.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add department</DialogTitle>
          <DialogDescription>
            Create a department for job requests, positions, and employee
            records.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="department-name">Name</Label>
            <Input
              id="department-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Engineering"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-description">
              Description (optional)
            </Label>
            <Textarea
              id="department-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Team scope and responsibilities"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Parent department (optional)</Label>
            <Select
              value={parentId || '__none__'}
              onValueChange={(value) =>
                setParentId(value === '__none__' ? '' : value)
              }
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="No parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No parent</SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createDepartment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDepartment.isPending}>
              {createDepartment.isPending ? 'Creating…' : 'Create department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
