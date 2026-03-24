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
import { Input } from '@/shared/components/ui/input';

export function BankDetailsSection() {
  const form = useFormContext<EmployeeProfileFormValues>();

  return (
    <FormSectionCard title="Bank Details">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="awashBankAccountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Awash Bank *</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="awashBankAccountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Awash Bank *</FormLabel>
                <FormControl>
                  <Input placeholder="Account Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="dashenBankAccountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dashen Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dashenBankAccountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dashen Bank</FormLabel>
                <FormControl>
                  <Input placeholder="Account Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
          Add Bank
        </Button>
      </div>
    </FormSectionCard>
  );
}
