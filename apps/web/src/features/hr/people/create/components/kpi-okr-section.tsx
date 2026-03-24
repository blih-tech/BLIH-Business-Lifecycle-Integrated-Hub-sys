import { Plus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { EmployeeProfileFormValues } from '@/features/hr/people/create/form-schema';
import { FormSectionCard } from '@/features/hr/people/create/components/form-section-card';
import { Button } from '@/shared/components/ui/button';
import {
  FormControl,
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

function TargetSelectField({
  name,
  label,
}: {
  name: keyof EmployeeProfileFormValues;
  label: string;
}) {
  const form = useFormContext<EmployeeProfileFormValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value ?? ''}>
            <FormControl>
              <SelectTrigger className="h-[50px] w-full rounded-[6px] border-[#e5e5e5]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Option 1">Option 1</SelectItem>
              <SelectItem value="Option 2">Option 2</SelectItem>
              <SelectItem value="Option 3">Option 3</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function KpiOkrSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <FormSectionCard title="KPI Targets">
        <div className="space-y-4">
          <TargetSelectField
            name="kpiTarget1"
            label="Key Performance Indicator 1"
          />
          <TargetSelectField
            name="kpiTarget2"
            label="Key Performance Indicator 2"
          />
          <TargetSelectField
            name="kpiTarget3"
            label="Key Performance Indicator 3"
          />
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-[6px] border-[#e5e5e5] text-[#666]"
          >
            <Plus className="h-4 w-4" />
            Add KPI
          </Button>
        </div>
      </FormSectionCard>

      <FormSectionCard title="OKR Targets">
        <div className="space-y-4">
          <TargetSelectField
            name="okrTarget1"
            label="Objective & Key Result 1"
          />
          <TargetSelectField
            name="okrTarget2"
            label="Objective & Key Result 2"
          />
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-[6px] border-[#e5e5e5] text-[#666]"
          >
            <Plus className="h-4 w-4" />
            Add OKR
          </Button>
        </div>
      </FormSectionCard>
    </div>
  );
}
