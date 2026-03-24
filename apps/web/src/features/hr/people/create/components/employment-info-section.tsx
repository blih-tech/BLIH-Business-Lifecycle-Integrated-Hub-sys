import { useFormContext } from 'react-hook-form';
import { Upload } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export function EmploymentInfoSection() {
  const form = useFormContext<EmployeeProfileFormValues>();

  return (
    <FormSectionCard
      title="Employment Details"
      description="Role and employment setup information."
    >
      <div className="grid gap-4">
        <FormItem>
          <FormLabel>Offer Letter *</FormLabel>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Technical Dept.">
                    Technical Dept.
                  </SelectItem>
                  <SelectItem value="Digital Marketing Dept.">
                    Digital Marketing Dept.
                  </SelectItem>
                  <SelectItem value="People Operations">
                    People Operations
                  </SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
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
              <FormLabel>Reporting To *</FormLabel>
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
              <FormLabel>Role/Position *</FormLabel>
              <FormControl>
                <Input placeholder="Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
