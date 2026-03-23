export type CulturePolicy = {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  icon: "shield" | "badge" | "users" | "zap";
};

export type CultureInitiative = {
  id: string;
  title: string;
  status: string;
  description: string;
  timeline: string;
  assignedTo: string;
  participantsCount: number;
  participantInitials: string[];
  extraParticipants: number;
};

export type CultureImpactMetric = {
  id: string;
  label: string;
  value: string;
};
