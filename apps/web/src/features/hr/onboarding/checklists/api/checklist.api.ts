const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  return localStorage.getItem('token') || '';
}

export async function getChecklists() {
  const res = await fetch(`${BASE_URL}/hr/onboarding/checklists`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch checklists');

  const json = await res.json();
  return json.data;
}

export async function submitChecklist(taskId: string, type?: string) {
  const res = await fetch(`${BASE_URL}/hr/onboarding/tasks/${taskId}/${type}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error('Failed to submit checklist');
}

export async function approveChecklist(taskId: string, type?: string) {
  const res = await fetch(
    `${BASE_URL}/hr/onboarding/tasks/${taskId}/${type}/verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ approved: true }),
    },
  );

  if (!res.ok) throw new Error('Failed to approve checklist');
}

export async function rejectChecklist(taskId: string, type?: string) {
  const res = await fetch(
    `${BASE_URL}/hr/onboarding/tasks/${taskId}/${type}/verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        approved: false,
        hrFeedback: 'Needs correction',
      }),
    },
  );

  if (!res.ok) throw new Error('Failed to reject checklist');
}
