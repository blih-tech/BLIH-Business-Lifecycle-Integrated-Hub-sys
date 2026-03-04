"use client";

import { ArrowUpDown, ListFilter, Search } from "lucide-react";

import type { ReviewStatus } from "@/features/hr/performance/review/types";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type ReviewFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  leaveType: string;
  onLeaveTypeChange: (value: string) => void;
  status: "all" | ReviewStatus;
  onStatusChange: (value: "all" | ReviewStatus) => void;
  gender: string;
  onGenderChange: (value: string) => void;
  resultGroup: string;
  onResultGroupChange: (value: string) => void;
  sortBy: "name-asc" | "name-desc";
  onSortByChange: (value: "name-asc" | "name-desc") => void;
};

export function ReviewFilters({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  leaveType,
  onLeaveTypeChange,
  status,
  onStatusChange,
  gender,
  onGenderChange,
  resultGroup,
  onResultGroupChange,
  sortBy,
  onSortByChange,
}: ReviewFiltersProps) {
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
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name..."
            className="h-8 rounded-[4px] border-input bg-white pl-9 text-sm"
          />
        </div>

        <Select value={sortBy} onValueChange={(value) => onSortByChange(value as "name-asc" | "name-desc")}>
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
      </div>

      <div className="flex flex-wrap gap-2">
        <SimpleSelect value={department} onValueChange={onDepartmentChange} placeholder="Department" />
        <SimpleSelect value={leaveType} onValueChange={onLeaveTypeChange} placeholder="Leave Type" />
        <SimpleSelect value={status} onValueChange={(value) => onStatusChange(value as "all" | ReviewStatus)} placeholder="Status" />
        <SimpleSelect value={gender} onValueChange={onGenderChange} placeholder="Gender" />
        <SimpleSelect value={resultGroup} onValueChange={onResultGroupChange} placeholder="Result Group" />
      </div>
    </section>
  );
}

function SimpleSelect({
  value,
  onValueChange,
  placeholder,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}) {
  const options = getOptions(placeholder);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger size="sm" className="h-8 min-w-[112px] rounded-[4px] border-input bg-white text-xs text-muted-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function getOptions(type: string) {
  if (type === "Department") {
    return [
      { value: "all", label: "Department" },
      { value: "Engineering", label: "Engineering" },
      { value: "Marketing", label: "Marketing" },
      { value: "Design", label: "Design" },
    ];
  }

  if (type === "Leave Type") {
    return [
      { value: "all", label: "Leave Type" },
      { value: "Annual", label: "Annual" },
      { value: "Sick", label: "Sick" },
      { value: "Emergency", label: "Emergency" },
    ];
  }

  if (type === "Status") {
    return [
      { value: "all", label: "Status" },
      { value: "completed", label: "Completed" },
      { value: "in-progress", label: "In Progress" },
    ];
  }

  if (type === "Gender") {
    return [
      { value: "all", label: "Gender" },
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
    ];
  }

  return [
    { value: "all", label: "Result Group" },
    { value: "Top", label: "Top" },
    { value: "Middle", label: "Middle" },
    { value: "Needs Improvement", label: "Needs Improvement" },
  ];
}
