import type { EmployeeDraftProfile } from '@/features/hr/people/create/types';

export const EMPLOYEE_PROFILE_PREVIEW =
  'https://www.figma.com/api/mcp/asset/e525abdf-74f9-453c-ae2b-3eef585138ab';

export const employeeDraftProfiles: EmployeeDraftProfile[] = [
  {
    id: 'draft-profile-1',
    title: 'Draft Employee Profile 1',
    createdAt: 'Dec 15, 2024',
    updatedAt: 'Dec 15, 2024',
    previewImage: EMPLOYEE_PROFILE_PREVIEW,
  },
];
