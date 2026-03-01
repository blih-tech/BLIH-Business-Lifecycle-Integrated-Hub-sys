type PositionWithDepartment = {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  department: {
    name: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const mapPosition = (position: PositionWithDepartment) => ({
  id: position.id,
  title: position.title,
  description: position.description,
  departmentId: position.departmentId,
  departmentName: position.department.name,
  isActive: position.isActive,
  createdAt: position.createdAt.toISOString(),
  updatedAt: position.updatedAt.toISOString(),
});
