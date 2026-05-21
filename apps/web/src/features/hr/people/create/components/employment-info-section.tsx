import { useFormContext } from 'react-hook-form';
import { Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DepartmentPermissions,
  PositionPermissions,
} from '@repo/types/rbac/permissions.constants';

import type { EmployeeProfileFormValues } from '@/features/hr/people/create/form-schema';
import { CreateDepartmentDialog } from '@/features/hr/departments/components/create-department-dialog';
import { CreatePositionDialog } from '@/features/hr/positions/components/create-position-dialog';
import { FormSectionCard } from '@/features/hr/people/create/components/form-section-card';
import { useHrAbility } from '@/shared/auth/hr-ability-context';
import { Button } from '@/shared/components/ui/button';
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
import { useDepartments, usePositions } from '@/hooks/hr/use-reference-data';

export function EmploymentInfoSection() {
  const form = useFormContext<EmployeeProfileFormValues>();
  const { hasPermission } = useHrAbility();
  const selectedDepartmentId = form.watch('department');
  const [createDepartmentOpen, setCreateDepartmentOpen] = useState(false);
  const [createPositionOpen, setCreatePositionOpen] = useState(false);
  const canCreateDepartment = hasPermission(DepartmentPermissions.CREATE);
  const canCreatePosition = hasPermission(PositionPermissions.CREATE);

  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const { data: positions = [], isLoading: positionsLoading } = usePositions(
    selectedDepartmentId || undefined,
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        value: department.id,
        label: department.name,
      })),
    [departments],
  );
  const selectedDepartmentName = useMemo(() => {
    if (!selectedDepartmentId) return '';
    return (
      departmentOptions.find((option) => option.value === selectedDepartmentId)
        ?.label ?? ''
    );
  }, [departmentOptions, selectedDepartmentId]);

  return (
    <FormSectionCard
      title="Employment Details"
      description="Role and employment setup information."
    >
      <div className="grid gap-4">
        <FormItem>
          <FormLabel>Offer Letter</FormLabel>
          <div className="flex items-center gap-3">
            <FormField
              control={form.control}
              name="offerLetterUpload"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="file"
                        className="absolute inset-0 z-10 cursor-pointer opacity-0"
                        onChange={(event) => {
                          const fileName = event.target.files?.[0]?.name ?? '';
                          field.onChange(fileName);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-[50px] w-full justify-start rounded-[6px] border-[#e5e5e5] text-[#666]"
                      >
                        <Upload className="h-4 w-4" />
                        {field.value || 'Upload'}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span className="text-xs text-[#6b7280]">or</span>
            <FormField
              control={form.control}
              name="offerLetterSource"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger className="h-[50px] w-full rounded-[6px] border-[#e5e5e5] text-[#6b7280]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="previous">Previous Offer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormItem>
      </div>

      <div className="mt-4 grid gap-4">
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Department *</FormLabel>
                {canCreateDepartment ? (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0 text-xs"
                    onClick={() => setCreateDepartmentOpen(true)}
                  >
                    Add department
                  </Button>
                ) : null}
              </div>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue('rolePosition', '');
                }}
                value={field.value ?? ''}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        deptsLoading ? 'Loading…' : 'Select department'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reportingTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reporting To</FormLabel>
              <FormControl>
                <Input placeholder="Manager name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rolePosition"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Role / Position</FormLabel>
                {canCreatePosition ? (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0 text-xs"
                    onClick={() => setCreatePositionOpen(true)}
                  >
                    Add position
                  </Button>
                ) : null}
              </div>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ''}
                disabled={!selectedDepartmentId && positions.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedDepartmentId && positions.length === 0
                          ? 'Select department first'
                          : positionsLoading
                            ? 'Loading…'
                            : positions.length === 0
                              ? 'No positions in this department'
                              : 'Select position'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <CreateDepartmentDialog
        open={createDepartmentOpen}
        onOpenChange={setCreateDepartmentOpen}
        parentOptions={departmentOptions}
        onCreated={(department) => {
          form.setValue('department', department.id, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          form.setValue('rolePosition', '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
      />

      <CreatePositionDialog
        open={createPositionOpen}
        onOpenChange={setCreatePositionOpen}
        departmentId={selectedDepartmentId}
        departmentName={selectedDepartmentName || undefined}
        onCreated={(position) => {
          // If the position was created in a different department (newly created), update the department selection
          if (position.departmentId !== selectedDepartmentId) {
            form.setValue('department', position.departmentId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }
          form.setValue('rolePosition', position.id, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
      />
    </FormSectionCard>
  );
}
