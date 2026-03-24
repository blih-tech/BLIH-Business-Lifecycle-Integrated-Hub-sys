"use client";

import { useMemo, useState } from "react";

import {
  evaluationForms,
  evaluationSummaryStats,
} from "@/features/hr/performance/evaluation-form/mock-data";
import type {
  EvaluationFormItem,
  EvaluationSortBy,
} from "@/features/hr/performance/evaluation-form/types";

import {
  EvaluationFilters,
  EvaluationFormsList,
  EvaluationHeader,
  EvaluationSummaryGrid,
} from "./components";

export * from "@/features/hr/performance/evaluation-form/components";
export * from "@/features/hr/performance/evaluation-form/types";

function sortItems(items: EvaluationFormItem[], sortBy: EvaluationSortBy) {
  return [...items].sort((a, b) =>
    sortBy === "name-desc" ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title),
  );
}

export function PerformanceEvaluationFormContent() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<EvaluationSortBy>("name-asc");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const rows = evaluationForms.filter((item) => !query || item.title.toLowerCase().includes(query));
    return sortItems(rows, sortBy);
  }, [search, sortBy]);

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <EvaluationFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <EvaluationHeader />
      <EvaluationSummaryGrid items={evaluationSummaryStats} />
      <EvaluationFormsList items={filteredItems} />
    </main>
  );
}
