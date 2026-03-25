import { useFormContext } from "react-hook-form";

import type { EmployeeProfileFormValues } from "@/features/hr/people/create/form-schema";
import { FormSectionCard } from "@/features/hr/people/create/components/form-section-card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

export function ContractCompensationSection() {
  const form = useFormContext<EmployeeProfileFormValues>();

  return (
    <FormSectionCard title="Contract & Compensation">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date *</FormLabel>
              <FormControl>
                <Input type="date" placeholder="Value" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="annualSalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Salary *</FormLabel>
              <FormControl>
                <div className="flex h-12 items-center rounded-[6px] border border-[#e5e5e5] bg-transparent px-3">
                  <span className="mr-2 text-xs font-semibold tracking-[-0.1504px] text-[#666]">ETB</span>
                  <Input
                    className="h-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    placeholder="15,000"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4">
        <FormField
          control={form.control}
          name="probationPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probation Period *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-[50px] w-full rounded-[6px] border-[#e5e5e5]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="2 months">2 months</SelectItem>
                  <SelectItem value="3 months">3 months</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4">
        <FormField
          control={form.control}
          name="compensationNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Payment, Role, and Probation notes..."
                  className="min-h-[120px] rounded-[6px] border-[#e5e5e5]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
