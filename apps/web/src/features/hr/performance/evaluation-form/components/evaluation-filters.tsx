"use client";

import type React from "react";

import { ArrowUpDown, ListFilter, Plus, Search } from "lucide-react";

import type { EvaluationSortBy } from "@/features/hr/performance/evaluation-form/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type EvaluationFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: EvaluationSortBy;
  onSortByChange: (value: EvaluationSortBy) => void;
};

export function EvaluationFilters({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
}: EvaluationFiltersProps) {
  return (
    <section className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1 text-xs text-black">
        <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
        Filter
      </div>

      <div className="relative min-w-[260px] flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
          placeholder="Search by name..."
          className="h-8 rounded-[4px] border-input bg-white pl-9 text-sm"
        />
      </div>

      <Select value={sortBy} onValueChange={(value: string) => onSortByChange(value as EvaluationSortBy)}>
        <SelectTrigger size="sm" className="h-8 min-w-[88px] rounded-[4px] border-input bg-white text-xs">
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

      <Button size="sm" className="h-8 rounded-[6px] px-3 text-xs font-medium">
        <Plus className="h-3.5 w-3.5" />
        Create
      </Button>
    </section>
  );
}
