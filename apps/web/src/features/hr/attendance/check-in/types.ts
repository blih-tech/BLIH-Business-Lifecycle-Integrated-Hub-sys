export type CheckinViewMode = "daily" | "weekly" | "monthly";

export type CheckinStatus = "completed" | "in-progress" | "missed";

export type CheckinSort = "name-asc" | "name-desc";

export type CheckinStampValue = string | "Missed" | null;

export type CheckinStamps = {
  morIn: CheckinStampValue;
  lunOut: CheckinStampValue;
  lunIn: CheckinStampValue;
  aftOut: CheckinStampValue;
};

export type CheckinRow = {
  id: string;
  employeeId: string;
  name: string;
  initials: string;
  department: string;
  status: CheckinStatus;
  stamps: CheckinStamps;
};

export type CheckinSection = {
  id: string;
  title: string;
  subtitle?: string;
  railLabel?: string;
  rows: CheckinRow[];
};

export type AttendanceCheckinStatItem = {
  id: string;
  label: string;
  value: string;
  icon: "clock-3" | "circle-check-big";
};
