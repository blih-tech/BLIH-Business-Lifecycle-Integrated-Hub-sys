export type GrievanceStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface GrievanceResponseDto {
  id: string;
  employeeId: string;
  subject: string;
  description: string;
  category: string | null;
  submittedAt: string;
  assignedToId: string | null;
  status: GrievanceStatus;
  resolutionNotes: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGrievanceDto {
  employeeId: string;
  subject: string;
  description: string;
  category?: string | null;
}

export interface UpdateGrievanceDto {
  assignedToId?: string | null;
  status?: GrievanceStatus;
  resolutionNotes?: string | null;
  closedAt?: string | null;
}
