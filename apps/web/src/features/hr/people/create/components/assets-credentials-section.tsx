import { Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { EmployeeProfileFormValues } from "@/features/hr/people/create/form-schema";
import { FormSectionCard } from "@/features/hr/people/create/components/form-section-card";
import { Button } from "@/shared/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export function AssetsCredentialsSection() {
  const form = useFormContext<EmployeeProfileFormValues>();

  return (
    <FormSectionCard title="Assets & Credentials Responsible">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="assetResponsibleFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsible For</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger className="h-[50px] w-full rounded-[6px] border-[#e5e5e5]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Laptop">Laptop</SelectItem>
                    <SelectItem value="Monitor">Monitor</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="laptopModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Laptop Model</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="MacBook Pro 16-inch" {...field} />
                    <Plus className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="C02XK0ABCD12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="credentialResponsibleFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsible For</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger className="h-[50px] w-full rounded-[6px] border-[#e5e5e5]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Credential">Credential</SelectItem>
                    <SelectItem value="Security Access">Security Access</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credentialType1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credential Type</FormLabel>
                <FormControl>
                  <Input placeholder="Web Analytics & SEO Password Sheet" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credentialType2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credential Type</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Digital Password ToolKit" {...field} />
                    <Plus className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="mt-4">
        <Button type="button" variant="outline" className="h-8 rounded-[6px] border-[#e5e5e5] text-[#666]">
          <Plus className="h-4 w-4" />
          Add Responsibility
        </Button>
      </div>
    </FormSectionCard>
  );
}
