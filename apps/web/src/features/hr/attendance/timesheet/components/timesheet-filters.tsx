"use client";

import { ListFilter, Search } from "lucide-react";

import type { TimesheetStatus, TimesheetViewMode } from "@/features/hr/attendance/timesheet/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type TimesheetFiltersProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  status: "all" | TimesheetStatus;
  onStatusChange: (value: "all" | TimesheetStatus) => void;
  viewMode: TimesheetViewMode;
  onViewModeChange: (value: TimesheetViewMode) => void;
  departments: readonly string[];
};

export function TimesheetFilters({
  searchTerm,
  onSearchTermChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  viewMode,
  onViewModeChange,
  departments,
}: TimesheetFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
      <div className="relative lg:w-[343px]">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Search employees..."
          className="h-9 rounded-[6px] border-input bg-white pl-9 text-sm"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-[6px] border-input bg-white text-muted-foreground"
        >
          <ListFilter className="h-4 w-4" />
        </Button>

        <Select value={department} onValueChange={onDepartmentChange}>
          <SelectTrigger size="sm" className="h-9 min-w-[160px] rounded-[6px] border-input bg-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? "All Departments" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(value: string) => onStatusChange(value as "all" | TimesheetStatus)}>
          <SelectTrigger size="sm" className="h-9 min-w-[140px] rounded-[6px] border-input bg-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="overtime">Overtime</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>

        <Select value={viewMode} onValueChange={(value: string) => onViewModeChange(value as TimesheetViewMode)}>
          <SelectTrigger size="sm" className="h-9 min-w-[140px] rounded-[6px] border-input bg-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
