'use client';

import type React from 'react';

import { ArrowUpDown, ListFilter, Search } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type OkrsFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  sortBy: 'name-asc' | 'name-desc';
  onSortByChange: (value: 'name-asc' | 'name-desc') => void;
};

export function OkrsFilters({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  sortBy,
  onSortByChange,
}: OkrsFiltersProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 text-xs text-black">
          <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
          Filter
        </div>

        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search by name..."
            className="h-8 rounded-[4px] border-input bg-white pl-9 text-sm"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value: string) =>
            onSortByChange(value as 'name-asc' | 'name-desc')
          }
        >
          <SelectTrigger
            size="sm"
            className="h-8 min-w-[88px] rounded-[4px] border-input bg-white text-xs"
          >
            <div className="inline-flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={department} onValueChange={onDepartmentChange}>
          <SelectTrigger
            size="sm"
            className="h-8 min-w-[112px] rounded-[4px] border-input bg-white text-xs text-muted-foreground"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Department</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
