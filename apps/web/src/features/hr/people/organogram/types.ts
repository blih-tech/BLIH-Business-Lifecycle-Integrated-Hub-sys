export type OrgPersonNode = {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  managerId?: string | null;
  avatarInitials?: string;
};

export type OrganogramMeta = {
  initialZoomPercent: number;
  minZoomPercent: number;
  maxZoomPercent: number;
  zoomStep: number;
};
