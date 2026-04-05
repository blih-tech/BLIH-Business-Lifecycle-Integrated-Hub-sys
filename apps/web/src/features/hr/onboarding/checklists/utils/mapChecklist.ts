type ApiChecklist = {
  id: string;
  status: string;
  createdAt: string;
  taskInstance?: {
    title?: string;
  };
};

export function mapChecklistFromApi(apiChecklist: ApiChecklist) {
  return {
    id: apiChecklist.id,
    title: apiChecklist.taskInstance?.title || 'Untitled Task',
    status: apiChecklist.status,
    createdAt: apiChecklist.createdAt,
  };
}
