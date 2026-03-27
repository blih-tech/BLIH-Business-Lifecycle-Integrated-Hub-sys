export type ExitResignStatItem = {
  id: string;
  label: string;
  value: string;
  icon: "received" | "pending" | "approved" | "month";
};

export type ExitResignMetaField = {
  id: string;
  label: string;
  value: string;
};

export type ExitResignRequestItem = {
  id: string;
  initials: string;
  name: string;
  department: string;
  status: "pending" | "approved";
  role: string;
  meta: [ExitResignMetaField, ExitResignMetaField, ExitResignMetaField, ExitResignMetaField];
  letterTitle: string;
  letterBody: string;
};
