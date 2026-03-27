import type {
  ActivityPoint,
  AttendanceStatItem,
  PerformanceCardItem,
} from "@/features/hr/attendance/overview/types";

export const attendanceStats: AttendanceStatItem[] = [
  { id: "pending-requests", label: "Pending Requests", value: "12", icon: "clock-3" },
  { id: "check-ins-today", label: "Total Check-ins Today", value: "28", icon: "circle-check-big" },
  { id: "present", label: "Present", value: "45", icon: "trending-up" },
];

export const performanceCards: PerformanceCardItem[] = [
  { id: "daily", label: "Daily", value: "8.5h", target: "8h", performance: "106%", icon: "clock-3" },
  { id: "monthly", label: "Monthly", value: "168h", target: "160h", performance: "105%", icon: "calendar-days" },
  { id: "annually", label: "Annually", value: "2016h", target: "1920h", performance: "105%", icon: "trending-up" },
];

export const activityPresenceData: ActivityPoint[] = [
  { month: "Jan", value: 125 },
  { month: "Feb", value: 136 },
  { month: "Mar", value: 148 },
  { month: "Apr", value: 95 },
  { month: "May", value: 142 },
  { month: "Jun", value: 136 },
  { month: "Jul", value: 166 },
  { month: "Aug", value: 112 },
  { month: "Sep", value: 139 },
  { month: "Oct", value: 145 },
  { month: "Nov", value: 136 },
  { month: "Dec", value: 102 },
];
