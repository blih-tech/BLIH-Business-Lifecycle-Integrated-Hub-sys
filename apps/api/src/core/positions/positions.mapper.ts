type PositionWithDepartment = {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  department: {
    name: string;
  };
  gradeId: string | null;
  grade: {
    code: string;
    name: string;
    level: number;
  } | null;
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
  gradeId: position.gradeId,
  gradeCode: position.grade?.code ?? null,
  gradeName: position.grade?.name ?? null,
  gradeLevel: position.grade?.level ?? null,
  isActive: position.isActive,
  createdAt: position.createdAt.toISOString(),
  updatedAt: position.updatedAt.toISOString(),
});
