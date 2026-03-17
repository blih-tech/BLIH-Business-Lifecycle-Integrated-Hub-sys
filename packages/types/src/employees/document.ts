export type DocumentType =
  | 'CONTRACT'
  | 'ID'
  | 'CERTIFICATE'
  | 'MEDICAL'
  | 'RESUME'
  | 'POLICY_ACK'
  | 'QUALIFICATION'
  | 'OTHER';

export interface CreateEmployeeDocumentDto {
  type: DocumentType;
  typeOther?: string;
  fileUrl: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  issueDate?: string;
  expiryDate?: string;
  isMandatory?: boolean;
}

export interface UpdateEmployeeDocumentDto {
  typeOther?: string;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  isMandatory?: boolean;
  verified?: boolean;
  verifiedById?: string | null;
  verifiedAt?: string | null;
}

export interface EmployeeDocumentResponseDto {
  id: string;
  employeeId: string;
  type: DocumentType;
  typeOther: string | null;
  fileUrl: string;
  fileName: string | null;
  fileSizeBytes: number | null;
  mimeType: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  isMandatory: boolean;
  verified: boolean;
  verifiedById: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
