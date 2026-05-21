/**
 * seed-jobs-via-api.ts
 *
 * Standalone script that creates real job postings by calling the running API.
 * It fetches departments, positions, and auth context from the live system —
 * no hardcoded IDs, no demo data.
 *
 * Usage: npx tsx packages/database/seed/seed-jobs-via-api.ts <ACCESS_TOKEN>
 */

const API_BASE = 'http://localhost:5000/api/v1';

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
}

interface AuthUser {
  id: string;
  username: string;
}

// ─── API helpers ──────────────────────────────────────────────────────

async function apiFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(`API ${init?.method ?? 'GET'} ${path} failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.data as T;
}

// ─── Build job payloads dynamically ───────────────────────────────────

function buildJobPayloads(
  departments: Department[],
  positions: Position[],
  user: AuthUser,
) {
  // Build lookup maps
  const deptByName = new Map(departments.map((d) => [d.name, d]));
  const posByDept = new Map<string, Position[]>();
  for (const p of positions) {
    const list = posByDept.get(p.departmentId) ?? [];
    list.push(p);
    posByDept.set(p.departmentId, list);
  }

  const jobs: Array<{
    label: string;
    payload: Record<string, unknown>;
  }> = [];

  const richText = (text: string) => ({
    type: 'doc',
    version: 1,
    content: [{ type: 'paragraph', text }],
  });

  const futureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const defaultAppForm = {
    applicantFields: [
      { key: 'PHONE', enabled: true, required: false, order: 1 },
      { key: 'LINKEDIN_URL', enabled: true, required: false, order: 2 },
      { key: 'RESUME_URL', enabled: true, required: true, order: 3 },
      { key: 'COVER_LETTER', enabled: true, required: false, order: 4 },
      { key: 'EXPECTED_SALARY', enabled: true, required: false, order: 5 },
    ],
    sections: [
      { key: 'EDUCATION', enabled: true, required: false, order: 1 },
      { key: 'EXPERIENCE', enabled: true, required: true, order: 2 },
    ],
    customFields: [],
  };

  // ── For each real department + position, generate fitting jobs ──

  for (const [deptId, deptPositions] of posByDept.entries()) {
    const dept = departments.find((d) => d.id === deptId);
    if (!dept) continue;

    for (const pos of deptPositions) {
      // Skip junk/test data (positions with very short or random names)
      if (pos.title.length < 3 || !/^[A-Za-z]/.test(pos.title)) continue;

      // Generate a Senior-level job
      jobs.push({
        label: `Senior ${pos.title} Developer – ${dept.name}`,
        payload: {
          requestForm: {
            jobTitle: `Senior ${pos.title} Developer`,
            department: dept.id,
            requestedBy: user.username,
            position: pos.id,
            requestType: 'NEW',
            businessJustification: `Expanding the ${dept.name} team with a senior ${pos.title} developer to lead critical initiatives and mentor junior team members.`,
            employmentType: 'FULL_TIME',
            workMode: 'HYBRID',
            urgency: 'HIGH',
            neededByDate: futureDate(30),
            priority: 'HIGH',
          },
          job: {
            title: `Senior ${pos.title} Developer`,
            departmentId: dept.id,
            positionId: pos.id,
            description: richText(
              `We are hiring a Senior ${pos.title} Developer to join our ${dept.name} team. ` +
              `You will lead the design and implementation of scalable solutions, mentor junior engineers, ` +
              `drive architectural decisions, and collaborate closely with product and design stakeholders.`,
            ),
            summary: richText(
              `Lead ${pos.title.toLowerCase()} development in our ${dept.name.toLowerCase()} department.`,
            ),
            experienceLevel: 'SENIOR',
            contractType: 'PERMANENT',
            employmentType: 'FULL_TIME',
            workLocationType: 'HYBRID',
            city: 'Addis Ababa',
            country: 'Ethiopia',
            openings: 2,
            salaryMin: 75000,
            salaryMax: 120000,
            currency: 'ETB',
            salaryMode: 'NEGOTIABLE',
            benefits: ['Health Insurance', 'Remote Fridays', 'Learning Budget', 'Stock Options'],
            requiredSkills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'REST APIs'],
            preferredSkills: ['NestJS', 'Next.js', 'Prisma', 'Docker', 'CI/CD'],
            responsibilities: [
              `Lead ${pos.title.toLowerCase()} architecture and delivery`,
              'Write clean, testable, production-ready code',
              'Conduct code reviews and provide technical mentorship',
              'Collaborate with product managers on technical feasibility',
              'Drive continuous improvement of engineering practices',
            ],
            tools: ['VS Code', 'Git', 'Jira', 'Figma', 'Postman'],
            hiringManagerId: user.id,
            applicationDeadline: futureDate(45),
          },
          applicationForm: defaultAppForm,
        },
      });

      // Generate a Mid-level job
      jobs.push({
        label: `${pos.title} Developer – ${dept.name}`,
        payload: {
          requestForm: {
            jobTitle: `${pos.title} Developer`,
            department: dept.id,
            requestedBy: user.username,
            position: pos.id,
            requestType: 'NEW',
            businessJustification: `Growing the ${dept.name} team with a mid-level ${pos.title} developer to accelerate feature delivery.`,
            employmentType: 'FULL_TIME',
            workMode: 'ON_SITE',
            urgency: 'MEDIUM',
            neededByDate: futureDate(45),
            priority: 'MEDIUM',
          },
          job: {
            title: `${pos.title} Developer`,
            departmentId: dept.id,
            positionId: pos.id,
            description: richText(
              `Join our ${dept.name} team as a ${pos.title} Developer. ` +
              `You will build and maintain core platform features, write well-tested code, ` +
              `and work closely with senior engineers to deliver high-quality solutions.`,
            ),
            summary: richText(
              `Build core features as a ${pos.title.toLowerCase()} developer in ${dept.name.toLowerCase()}.`,
            ),
            experienceLevel: 'MID',
            contractType: 'PERMANENT',
            employmentType: 'FULL_TIME',
            workLocationType: 'ON_SITE',
            city: 'Addis Ababa',
            country: 'Ethiopia',
            openings: 3,
            salaryMin: 40000,
            salaryMax: 70000,
            currency: 'ETB',
            salaryMode: 'FIXED',
            benefits: ['Health Insurance', 'Learning Budget', 'Team Events'],
            requiredSkills: ['JavaScript', 'Node.js', 'SQL', 'Git'],
            preferredSkills: ['TypeScript', 'React', 'Docker'],
            responsibilities: [
              `Develop and maintain ${pos.title.toLowerCase()} features`,
              'Write unit and integration tests',
              'Participate in sprint planning and daily standups',
              'Document APIs and technical decisions',
              'Collaborate with cross-functional teams',
            ],
            tools: ['VS Code', 'Git', 'Postman'],
            hiringManagerId: user.id,
            applicationDeadline: futureDate(35),
          },
          applicationForm: defaultAppForm,
        },
      });

      // Generate an Intern position
      jobs.push({
        label: `${pos.title} Intern – ${dept.name}`,
        payload: {
          requestForm: {
            jobTitle: `${pos.title} Intern`,
            department: dept.id,
            requestedBy: user.username,
            position: pos.id,
            requestType: 'NEW',
            businessJustification: `Bringing fresh talent into ${dept.name} through a structured internship program.`,
            employmentType: 'INTERN',
            workMode: 'ON_SITE',
            urgency: 'LOW',
            neededByDate: futureDate(60),
            priority: 'LOW',
          },
          job: {
            title: `${pos.title} Intern`,
            departmentId: dept.id,
            positionId: pos.id,
            description: richText(
              `A 3-month internship for aspiring ${pos.title.toLowerCase()} developers. ` +
              `You will work on real projects under mentorship, contribute to our codebase, ` +
              `and gain hands-on experience in a professional engineering environment.`,
            ),
            summary: richText(
              `Launch your career with a ${pos.title.toLowerCase()} internship in ${dept.name.toLowerCase()}.`,
            ),
            experienceLevel: 'ENTRY',
            contractType: 'INTERNSHIP',
            employmentType: 'INTERN',
            workLocationType: 'ON_SITE',
            city: 'Addis Ababa',
            country: 'Ethiopia',
            openings: 4,
            salaryMin: 8000,
            salaryMax: 15000,
            currency: 'ETB',
            salaryMode: 'FIXED',
            benefits: ['Mentorship', 'Certificate of Completion', 'Potential Full-Time Offer'],
            requiredSkills: ['Programming Fundamentals', 'Problem Solving'],
            preferredSkills: ['JavaScript', 'Git'],
            responsibilities: [
              'Complete development tasks under mentor guidance',
              'Participate in team meetings and code reviews',
              'Document learnings and deliverables',
              'Present final project to the team',
            ],
            tools: ['VS Code', 'Git'],
            hiringManagerId: user.id,
            applicationDeadline: futureDate(25),
          },
          applicationForm: defaultAppForm,
        },
      });
    }
  }

  return jobs;
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  const token = process.argv[2];
  if (!token) {
    console.error('Usage: npx tsx seed-jobs-via-api.ts <ACCESS_TOKEN>');
    process.exit(1);
  }

  console.log('\n═══ Creating Jobs via Live API ═══\n');

  // 1. Fetch real data
  console.log('  Fetching authenticated user...');
  const meResponse = await apiFetch<AuthUser>('/auth/me', token);
  console.log(`  ✓ User: ${meResponse.username} (${meResponse.id})`);

  console.log('  Fetching departments...');
  const departments = await apiFetch<Department[]>('/departments', token);
  console.log(`  ✓ ${departments.length} departments found.`);

  console.log('  Fetching positions...');
  const positions = await apiFetch<Position[]>('/positions', token);
  console.log(`  ✓ ${positions.length} positions found.`);

  // 2. Build payloads from real data
  const jobs = buildJobPayloads(departments, positions, meResponse);
  console.log(`\n  Generated ${jobs.length} job payloads from real data.\n`);

  // 3. Create each job
  let created = 0;
  let failed = 0;

  for (const { label, payload } of jobs) {
    try {
      const result = await apiFetch<{ job: { id: string; slug: string } }>(
        '/hr/recruitment/jobs',
        token,
        { method: 'POST', body: JSON.stringify(payload) },
      );
      console.log(`  ✓ Created: "${label}" → ${result.job.slug}`);
      created++;
    } catch (err) {
      console.error(`  ✗ Failed: "${label}" → ${(err as Error).message.substring(0, 200)}`);
      failed++;
    }
  }

  console.log(`\n  Done: ${created} created, ${failed} failed.`);
  console.log('═══════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
