export interface ResourceResponseDto {
  id: string;
  moduleId: string;
  module: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
