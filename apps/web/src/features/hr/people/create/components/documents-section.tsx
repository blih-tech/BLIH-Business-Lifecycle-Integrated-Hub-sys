import { Plus, Upload } from 'lucide-react';
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
import { Input } from '@/shared/components/ui/input';

function UploadField({
  name,
  label,
  required,
}: {
  name: keyof EmployeeProfileFormValues;
  label: string;
  required?: boolean;
}) {
  const form = useFormContext<EmployeeProfileFormValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required ? ' *' : ''}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Upload className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              <Input placeholder="Upload" className="pl-9" {...field} />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function DocumentsSection() {
  return (
    <FormSectionCard title="Documents">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="space-y-4">
          <UploadField name="faydaIdDocument" label="Fayda ID" required />
          <UploadField
            name="educationalDocument"
            label="Educational Document"
            required
          />
        </div>
        <div className="space-y-4">
          <UploadField
            name="experienceCertificate"
            label="Experience Certificate"
          />
          <UploadField
            name="recommendationLetters"
            label="Recommendation Letters"
          />
        </div>
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          className="h-8 rounded-[6px] border-[#e5e5e5] text-[#666]"
        >
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      </div>
    </FormSectionCard>
  );
}
