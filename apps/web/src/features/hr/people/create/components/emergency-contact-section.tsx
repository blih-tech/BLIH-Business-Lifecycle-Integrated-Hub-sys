import { useFormContext } from 'react-hook-form';

import type { EmployeeProfileFormValues } from '@/features/hr/people/create/form-schema';
import { FormSectionCard } from '@/features/hr/people/create/components/form-section-card';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

export function EmergencyContactSection() {
  const form = useFormContext<EmployeeProfileFormValues>();

  return (
    <FormSectionCard title="Emergency Contact">
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="emergencyFirstName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="First Name *" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyPhoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Phone Number *" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyLastName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Last Name *" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyRelationship"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Relationship *" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyEmail"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email Address *" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyCity"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyCountryOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Country of Birth" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
