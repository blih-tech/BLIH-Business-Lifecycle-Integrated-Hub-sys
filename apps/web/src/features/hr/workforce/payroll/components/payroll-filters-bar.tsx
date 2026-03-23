import { ChevronDown, Download, ListFilter, Search } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

const filterItems = ['Department', 'Salary Range', 'Period', 'Job Type'];

export function PayrollFiltersBar() {
  return (
    <Card className="gap-0 rounded-[12px] border-border py-0 shadow-none">
      <CardContent className="flex flex-col gap-2.5 p-3.5 md:flex-row md:items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-2.5 text-xs font-medium text-black"
        >
          <ListFilter className="h-3.5 w-3.5 text-primary" />
          Filter
        </Button>

        <div className="relative md:w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999]" />
          <Input
            placeholder="Search employees..."
            className="h-8 rounded-[6px] border-[#e5e5e5] bg-white pl-8 text-xs"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-2.5 text-xs text-black"
        >
          Name
          <ChevronDown className="h-3.5 w-3.5 text-[#666]" />
        </Button>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {filterItems.map((item) => (
            <Button
              key={item}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-[6px] border-[#e5e5e5] bg-white px-2.5 text-xs font-normal text-[#666]"
            >
              {item}
              <ChevronDown className="h-3.5 w-3.5 text-[#666]" />
            </Button>
          ))}
        </div>

        <Button
          type="button"
          size="sm"
          className="h-8 rounded-[6px] bg-primary px-3 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </CardContent>
    </Card>
  );
}
