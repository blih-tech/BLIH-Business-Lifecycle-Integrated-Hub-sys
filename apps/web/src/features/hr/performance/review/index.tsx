"use client";

import { useMemo, useState } from "react";

import { reviewRows } from "@/features/hr/performance/review/mock-data";
import type { ReviewRow, ReviewStatus } from "@/features/hr/performance/review/types";

import { ReviewFilters, ReviewListCard } from "./components";

export * from "@/features/hr/performance/review/components";
export * from "@/features/hr/performance/review/types";

function sortRows(rows: ReviewRow[], sortBy: "name-asc" | "name-desc") {
  return [...rows].sort((a, b) =>
    sortBy === "name-desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
  );
}

export function PerformanceReviewContent() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [leaveType, setLeaveType] = useState("all");
  const [status, setStatus] = useState<"all" | ReviewStatus>("all");
  const [gender, setGender] = useState("all");
  const [resultGroup, setResultGroup] = useState("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc">("name-asc");

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    const rows = reviewRows.filter((row) => {
      const byName = !query || row.name.toLowerCase().includes(query);
      const byDepartment = department === "all" || row.department === department;
      const byLeaveType = leaveType === "all" || row.leaveType === leaveType;
      const byStatus = status === "all" || row.status === status;
      const byGender = gender === "all" || row.gender === gender;
      const byResultGroup = resultGroup === "all" || row.resultGroup === resultGroup;
      return byName && byDepartment && byLeaveType && byStatus && byGender && byResultGroup;
    });

    return sortRows(rows, sortBy);
  }, [search, department, leaveType, status, gender, resultGroup, sortBy]);

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <ReviewFilters
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={setDepartment}
        leaveType={leaveType}
        onLeaveTypeChange={setLeaveType}
        status={status}
        onStatusChange={setStatus}
        gender={gender}
        onGenderChange={setGender}
        resultGroup={resultGroup}
        onResultGroupChange={setResultGroup}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      <ReviewListCard rows={filteredRows} />
    </main>
  );
}
