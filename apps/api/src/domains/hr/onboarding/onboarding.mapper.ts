type OnboardingTaskRow = {
  id: string;
  checklistId: string;
  department: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  assignedToId: string | null;
  status: string;
  completedAt: Date | null;
  completedById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type OnboardingChecklistRow = {
  id: string;
  employeeId: string;
  onboardingId: string | null;
  hiringDecisionId: string | null;
  joinDate: Date;
  overseerId: string | null;
  totalItems: number;
  completedItems: number;
  status: string;
  teamLeadVerifiedAt: Date | null;
  ceoSignOffRequired: boolean;
  ceoSignOffAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tasks?: OnboardingTaskRow[];
};

export function mapOnboardingTaskResponse(task: OnboardingTaskRow) {
  return {
    id: task.id,
    checklistId: task.checklistId,
    department: task.department,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
    assignedToId: task.assignedToId,
    status: task.status,
    completedAt: task.completedAt?.toISOString() ?? null,
    completedById: task.completedById,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function mapOnboardingChecklistResponse(
  checklist: OnboardingChecklistRow,
) {
  return {
    id: checklist.id,
    employeeId: checklist.employeeId,
    onboardingId: checklist.onboardingId,
    hiringDecisionId: checklist.hiringDecisionId,
    joinDate: checklist.joinDate.toISOString().slice(0, 10),
    overseerId: checklist.overseerId,
    totalItems: checklist.totalItems,
    completedItems: checklist.completedItems,
    status: checklist.status,
    teamLeadVerifiedAt: checklist.teamLeadVerifiedAt?.toISOString() ?? null,
    ceoSignOffRequired: checklist.ceoSignOffRequired,
    ceoSignOffAt: checklist.ceoSignOffAt?.toISOString() ?? null,
    createdAt: checklist.createdAt.toISOString(),
    updatedAt: checklist.updatedAt.toISOString(),
    ...(checklist.tasks && {
      tasks: checklist.tasks.map(mapOnboardingTaskResponse),
    }),
  };
}
