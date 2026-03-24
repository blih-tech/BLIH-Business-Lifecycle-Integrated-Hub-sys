export type PeopleSummaryStat = {
  id: string;
  label: string;
  value: string;
  icon: "users" | "check-circle" | "clock-3";
};

export type PeopleWorkHoursStat = {
  id: string;
  label: string;
  value: string;
  target: string;
  performance: string;
  icon: "clock-3" | "calendar-days" | "trending-up";
};

export type PeopleChecklistStat = {
  id: string;
  label: string;
  value: string;
  icon: "square-check-big" | "calendar-days";
};

export type PeopleJobFrequencyPoint = {
  month: string;
  applications: number;
};
