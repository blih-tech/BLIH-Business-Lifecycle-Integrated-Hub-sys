export type AttendanceStatItem = {
  id: string;
  label: string;
  value: string;
  icon: "clock-3" | "circle-check-big" | "trending-up";
};

export type PerformanceCardItem = {
  id: string;
  label: string;
  value: string;
  target: string;
  performance: string;
  icon: "clock-3" | "calendar-days" | "trending-up";
};

export type ActivityPoint = {
  month: string;
  value: number;
};
