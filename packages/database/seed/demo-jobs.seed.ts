import type { PrismaClient } from '../src/prisma-client.js';

interface DemoJob {
  title: string;
  slug: string;
  positionTitle: string;
  departmentName: string;
  description: Record<string, unknown>;
  summary: Record<string, unknown> | null;
  experienceLevel: string;
  contractType: string;
  employmentType: string;
  workLocationType: string;
  city: string | null;
  country: string | null;
  openings: number;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  salaryMode: string;
  benefits: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  tools: string[];
  applicationDeadlineDays: number;
}

const richText = (text: string): Record<string, unknown> => ({
  type: 'doc',
  version: 1,
  content: [{ type: 'paragraph', text }],
});

/**
 * Department definitions — created only if they don't already exist.
 */
const REQUIRED_DEPARTMENTS = [
  { name: 'Engineering', description: 'Software Engineering & DevOps' },
  { name: 'Product', description: 'Product Management & Design' },
  { name: 'Human Resources', description: 'HR, Talent Acquisition & People Operations' },
  { name: 'Finance', description: 'Accounting, Budgeting & Financial Planning' },
  { name: 'Marketing', description: 'Brand, Growth & Digital Marketing' },
];

/**
 * Position definitions — created only if they don't already exist.
 */
const REQUIRED_POSITIONS = [
  { title: 'Software Engineer', departmentName: 'Engineering', code: 'SE' },
  { title: 'Senior Software Engineer', departmentName: 'Engineering', code: 'SSE' },
  { title: 'DevOps Engineer', departmentName: 'Engineering', code: 'DOE' },
  { title: 'Product Manager', departmentName: 'Product', code: 'PM' },
  { title: 'UI/UX Designer', departmentName: 'Product', code: 'UXD' },
  { title: 'HR Specialist', departmentName: 'Human Resources', code: 'HRS' },
  { title: 'Financial Analyst', departmentName: 'Finance', code: 'FA' },
  { title: 'Marketing Manager', departmentName: 'Marketing', code: 'MM' },
];

/**
 * 10 demo jobs spanning all contract types, experience levels, and work locations.
 */
const DEMO_JOBS: DemoJob[] = [
  {
    title: 'Senior Full-Stack Engineer',
    slug: 'senior-full-stack-engineer',
    positionTitle: 'Senior Software Engineer',
    departmentName: 'Engineering',
    description: richText(
      'We are looking for a Senior Full-Stack Engineer to join our platform team. ' +
      'You will design and implement scalable features across our NestJS backend and Next.js frontend, ' +
      'mentor junior engineers, and drive architectural decisions that shape our product.',
    ),
    summary: richText('Lead full-stack development on our flagship HR platform.'),
    experienceLevel: 'SENIOR',
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'HYBRID',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    openings: 2,
    salaryMin: 80000,
    salaryMax: 120000,
    currency: 'ETB',
    salaryMode: 'NEGOTIABLE',
    benefits: ['Health Insurance', 'Remote Fridays', 'Learning Budget', 'Stock Options'],
    requiredSkills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'REST APIs'],
    preferredSkills: ['NestJS', 'Next.js', 'Prisma', 'Docker', 'Kubernetes'],
    responsibilities: [
      'Design and implement new features across the full stack',
      'Write clean, testable, production-ready code',
      'Participate in code reviews and architectural discussions',
      'Mentor junior and mid-level engineers',
      'Collaborate with product and design teams on technical feasibility',
    ],
    tools: ['VS Code', 'Git', 'Jira', 'Figma', 'Postman'],
    applicationDeadlineDays: 45,
  },
  {
    title: 'Junior Backend Developer',
    slug: 'junior-backend-developer',
    positionTitle: 'Software Engineer',
    departmentName: 'Engineering',
    description: richText(
      'Join our engineering team as a Junior Backend Developer. ' +
      'You will work on building and maintaining REST APIs, database schemas, and background services ' +
      'using NestJS and PostgreSQL. Great opportunity for growth.',
    ),
    summary: richText('Start your career building robust backend services.'),
    experienceLevel: 'JUNIOR',
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'ON_SITE',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    openings: 3,
    salaryMin: 30000,
    salaryMax: 50000,
    currency: 'ETB',
    salaryMode: 'FIXED',
    benefits: ['Health Insurance', 'Mentorship Program', 'Learning Budget'],
    requiredSkills: ['JavaScript', 'Node.js', 'SQL'],
    preferredSkills: ['TypeScript', 'NestJS', 'PostgreSQL', 'Git'],
    responsibilities: [
      'Build and maintain REST API endpoints',
      'Write unit and integration tests',
      'Participate in daily standups and sprint planning',
      'Document technical decisions and APIs',
    ],
    tools: ['VS Code', 'Git', 'Postman'],
    applicationDeadlineDays: 30,
  },
  {
    title: 'DevOps & Cloud Infrastructure Engineer',
    slug: 'devops-cloud-infrastructure-engineer',
    positionTitle: 'DevOps Engineer',
    departmentName: 'Engineering',
    description: richText(
      'We need a DevOps Engineer to build and maintain our CI/CD pipelines, ' +
      'manage cloud infrastructure on AWS, and improve developer tooling. ' +
      'You will be instrumental in keeping our deployments reliable and fast.',
    ),
    summary: richText('Own the infrastructure that powers our platform.'),
    experienceLevel: 'MID',
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'REMOTE',
    city: null,
    country: null,
    openings: 1,
    salaryMin: 60000,
    salaryMax: 90000,
    currency: 'ETB',
    salaryMode: 'NEGOTIABLE',
    benefits: ['Fully Remote', 'Health Insurance', 'Home Office Stipend', 'Learning Budget'],
    requiredSkills: ['Docker', 'CI/CD', 'Linux', 'AWS', 'Terraform'],
    preferredSkills: ['Kubernetes', 'GitHub Actions', 'Monitoring (Grafana/Prometheus)', 'Ansible'],
    responsibilities: [
      'Design and maintain CI/CD pipelines',
      'Manage cloud infrastructure and deployments',
      'Implement monitoring, alerting, and incident response',
      'Optimize build and deployment processes',
      'Collaborate with developers on infrastructure requirements',
    ],
    tools: ['Docker', 'Terraform', 'GitHub Actions', 'AWS Console', 'Grafana'],
    applicationDeadlineDays: 60,
  },
  {
    title: 'Product Manager – HR Platform',
    slug: 'product-manager-hr-platform',
    positionTitle: 'Product Manager',
    departmentName: 'Product',
    description: richText(
      'Drive the product vision for our HR platform. You will work closely with engineering, design, and business ' +
      'stakeholders to define the product roadmap, prioritize features, and ensure we deliver solutions that ' +
      'delight our users and meet business objectives.',
    ),
    summary: richText('Shape the future of our HR management product.'),
    experienceLevel: 'SENIOR',
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'HYBRID',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    openings: 1,
    salaryMin: 70000,
    salaryMax: 100000,
    currency: 'ETB',
    salaryMode: 'NEGOTIABLE',
    benefits: ['Health Insurance', 'Flexible Hours', 'Conference Budget'],
    requiredSkills: ['Product Strategy', 'User Research', 'Agile/Scrum', 'Data Analysis'],
    preferredSkills: ['HR Domain Knowledge', 'SQL', 'Figma', 'A/B Testing'],
    responsibilities: [
      'Define and prioritize the product roadmap',
      'Conduct user research and translate insights into features',
      'Write detailed product requirements and user stories',
      'Collaborate with engineering on technical feasibility',
      'Track KPIs and measure feature impact',
    ],
    tools: ['Jira', 'Confluence', 'Figma', 'Mixpanel', 'Notion'],
    applicationDeadlineDays: 40,
  },
  {
    title: 'UI/UX Designer',
    slug: 'ui-ux-designer',
    positionTitle: 'UI/UX Designer',
    departmentName: 'Product',
    description: richText(
      'We are hiring a UI/UX Designer to craft beautiful, intuitive interfaces for our platform. ' +
      'You will conduct user research, create wireframes and prototypes, and work closely with engineers ' +
      'to deliver pixel-perfect designs.',
    ),
    summary: richText('Design intuitive experiences for HR professionals.'),
    experienceLevel: 'MID',
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'HYBRID',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    openings: 1,
    salaryMin: 45000,
    salaryMax: 70000,
    currency: 'ETB',
    salaryMode: 'FIXED',
    benefits: ['Health Insurance', 'Creative Days Off', 'Learning Budget'],
    requiredSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    preferredSkills: ['HTML/CSS', 'Accessibility (a11y)', 'Motion Design', 'Usability Testing'],
    responsibilities: [
      'Design user-centered interfaces for web applications',
      'Conduct user research and usability testing',
      'Create and maintain the design system',
      'Collaborate with product and engineering teams',
      'Deliver responsive designs for desktop and mobile',
    ],
    tools: ['Figma', 'FigJam', 'Adobe Illustrator', 'Miro', 'Storybook'],
    applicationDeadlineDays: 35,
  },
  {
    title: 'HR Recruitment Specialist',
    slug: 'hr-recruitment-specialist',
    positionTitle: 'HR Specialist',
    departmentName: 'Human Resources',
    description: richText(
      'Join our HR team as a Recruitment Specialist. You will manage the full recruitment lifecycle ' +
      'from sourcing to onboarding, coordinate interviews, and ensure a smooth candidate experience.',
    ),
    summary: richText('Drive talent acquisition and employer branding.'),
    experienceLevel: 'MID',
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'ON_SITE',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    openings: 2,
    salaryMin: 35000,
    salaryMax: 55000,
    currency: 'ETB',
    salaryMode: 'FIXED',
    benefits: ['Health Insurance', 'Professional Development', 'Team Events'],
    requiredSkills: ['Talent Sourcing', 'Interviewing', 'ATS Systems', 'Communication'],
    preferredSkills: ['Employer Branding', 'LinkedIn Recruiter', 'HRIS', 'Labor Law'],
    responsibilities: [
      'Source and screen candidates through multiple channels',
      'Coordinate and schedule interview sessions',
      'Manage the applicant tracking system',
      'Prepare offer letters and onboarding documents',
      'Track recruitment metrics and report to HR leadership',
    ],
    tools: ['BLIH Platform', 'LinkedIn Recruiter', 'Gmail', 'Google Meet'],
    applicationDeadlineDays: 25,
  },
  {
    title: 'Senior Financial Analyst',
    slug: 'senior-financial-analyst',
    positionTitle: 'Financial Analyst',
    departmentName: 'Finance',
    description: richText(
      'We are looking for a Senior Financial Analyst to lead budgeting, forecasting, and financial ' +
      'reporting for the organization. You will work with leadership to provide insights that drive ' +
      'strategic decision-making.',
    ),
    summary: richText('Lead financial planning and strategic analysis.'),
    experienceLevel: 'SENIOR',
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'ON_SITE',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    openings: 1,
    salaryMin: 60000,
    salaryMax: 85000,
    currency: 'ETB',
    salaryMode: 'NEGOTIABLE',
    benefits: ['Health Insurance', 'Performance Bonus', 'Professional Certifications'],
    requiredSkills: ['Financial Modeling', 'Budgeting', 'Excel', 'Financial Reporting', 'IFRS'],
    preferredSkills: ['Power BI', 'SAP', 'ERP Systems', 'CPA/ACCA'],
    responsibilities: [
      'Develop and maintain financial models and forecasts',
      'Prepare monthly, quarterly, and annual financial reports',
      'Analyze variances and provide actionable recommendations',
      'Support annual budgeting and strategic planning',
      'Ensure compliance with financial regulations and standards',
    ],
    tools: ['Excel', 'Power BI', 'QuickBooks', 'Google Sheets'],
    applicationDeadlineDays: 30,
  },
  {
    title: 'Digital Marketing Manager',
    slug: 'digital-marketing-manager',
    positionTitle: 'Marketing Manager',
    departmentName: 'Marketing',
    description: richText(
      'Lead our digital marketing strategy. You will plan and execute campaigns across social media, ' +
      'email, and content channels. Drive brand awareness, generate leads, and measure ROI.',
    ),
    summary: richText('Own the digital marketing strategy and execution.'),
    experienceLevel: 'MID',
    contractType: 'CONTRACT',
    employmentType: 'FULL_TIME',
    workLocationType: 'REMOTE',
    city: null,
    country: null,
    openings: 1,
    salaryMin: 50000,
    salaryMax: 75000,
    currency: 'ETB',
    salaryMode: 'FIXED',
    benefits: ['Fully Remote', 'Performance Bonus', 'Marketing Tool Subscriptions'],
    requiredSkills: ['Digital Marketing', 'SEO/SEM', 'Content Strategy', 'Social Media Management'],
    preferredSkills: ['Google Ads', 'Facebook Ads', 'HubSpot', 'Email Marketing', 'Analytics'],
    responsibilities: [
      'Develop and execute digital marketing campaigns',
      'Manage social media presence and content calendar',
      'Optimize SEO and paid advertising performance',
      'Analyze campaign metrics and report ROI',
      'Collaborate with product and sales teams on go-to-market strategy',
    ],
    tools: ['Google Analytics', 'HubSpot', 'Canva', 'Hootsuite', 'Mailchimp'],
    applicationDeadlineDays: 20,
  },
  {
    title: 'Software Engineering Intern',
    slug: 'software-engineering-intern',
    positionTitle: 'Software Engineer',
    departmentName: 'Engineering',
    description: richText(
      'A 3-month internship for aspiring software engineers. You will work on real projects, ' +
      'contribute to our codebase, and learn from experienced engineers.',
    ),
    summary: richText('Kick-start your software engineering career with a hands-on internship.'),
    experienceLevel: 'ENTRY',
    contractType: 'INTERNSHIP',
    employmentType: 'INTERN',
    workLocationType: 'ON_SITE',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    openings: 5,
    salaryMin: 8000,
    salaryMax: 15000,
    currency: 'ETB',
    salaryMode: 'FIXED',
    benefits: ['Mentorship', 'Certificate of Completion', 'Potential Full-Time Offer'],
    requiredSkills: ['Programming Fundamentals', 'Problem Solving'],
    preferredSkills: ['JavaScript', 'Python', 'Git', 'SQL'],
    responsibilities: [
      'Complete assigned development tasks under mentor guidance',
      'Participate in team meetings and code reviews',
      'Document learnings and deliverables',
      'Present final project to the engineering team',
    ],
    tools: ['VS Code', 'Git', 'Slack'],
    applicationDeadlineDays: 15,
  },
  {
    title: 'Freelance Technical Writer',
    slug: 'freelance-technical-writer',
    positionTitle: 'Software Engineer',
    departmentName: 'Engineering',
    description: richText(
      'We are looking for a freelance Technical Writer to create and maintain documentation ' +
      'for our APIs, SDKs, and developer guides.',
    ),
    summary: richText('Write world-class technical documentation for our developer platform.'),
    experienceLevel: 'MID',
    contractType: 'FREELANCE',
    employmentType: 'CONTRACT',
    workLocationType: 'REMOTE',
    city: null,
    country: null,
    openings: 1,
    salaryMin: null,
    salaryMax: null,
    currency: 'ETB',
    salaryMode: 'NOT_SPECIFIED',
    benefits: ['Flexible Schedule', 'Remote Work'],
    requiredSkills: ['Technical Writing', 'API Documentation', 'Markdown'],
    preferredSkills: ['OpenAPI/Swagger', 'Developer Portals', 'REST APIs', 'Git'],
    responsibilities: [
      'Write and maintain API reference documentation',
      'Create developer guides and tutorials',
      'Review and edit existing documentation for accuracy',
      'Collaborate with engineers to document new features',
    ],
    tools: ['Notion', 'Git', 'Swagger UI', 'VS Code'],
    applicationDeadlineDays: 20,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Resolves the HR Manager user from the database by known role or username.
 * Falls back through: hr.manager username → first user with hr_manager role → first active user.
 */
async function resolveCreator(prisma: PrismaClient) {
  // 1. Try by well-known username
  const byUsername = await prisma.user.findFirst({
    where: { username: 'hr.manager', status: 'ACTIVE' },
    select: { id: true, username: true },
  });
  if (byUsername) return byUsername;

  // 2. Try any user whose roles include hr_manager
  const byRole = await prisma.user.findFirst({
    where: {
      status: 'ACTIVE',
      roles: { some: { role: { name: 'hr_manager' } } },
    },
    select: { id: true, username: true },
  });
  if (byRole) return byRole;

  // 3. Fallback: first active user
  const fallback = await prisma.user.findFirst({
    where: { status: 'ACTIVE' },
    select: { id: true, username: true },
  });
  return fallback;
}

/**
 * Ensures all required departments exist. Returns a map of name → id
 * using real database records.
 */
async function ensureDepartments(prisma: PrismaClient): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  for (const dept of REQUIRED_DEPARTMENTS) {
    let record = await prisma.department.findFirst({
      where: { name: dept.name },
      select: { id: true, name: true },
    });

    if (!record) {
      record = await prisma.department.create({
        data: { name: dept.name, description: dept.description },
        select: { id: true, name: true },
      });
      console.log(`    + Created department: ${dept.name}`);
    }

    map.set(record.name, record.id);
  }

  return map;
}

/**
 * Ensures all required positions exist. Returns a map of "title|deptId" → id
 * using real database records.
 */
async function ensurePositions(
  prisma: PrismaClient,
  deptMap: Map<string, string>,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  for (const pos of REQUIRED_POSITIONS) {
    const deptId = deptMap.get(pos.departmentName);
    if (!deptId) continue;

    let record = await prisma.position.findFirst({
      where: { title: pos.title, departmentId: deptId },
      select: { id: true, title: true },
    });

    if (!record) {
      record = await prisma.position.create({
        data: { title: pos.title, code: pos.code, departmentId: deptId },
        select: { id: true, title: true },
      });
      console.log(`    + Created position: ${pos.title} (${pos.departmentName})`);
    }

    map.set(record.title, record.id);
  }

  return map;
}

// ─── Main ─────────────────────────────────────────────────────────────

/**
 * Seeds demo jobs using real database relationships.
 * - Resolves the creator (HR Manager) dynamically from the database
 * - Ensures departments and positions exist, using existing records when available
 * - Skips jobs whose slug already exists (idempotent)
 */
export async function seedDemoJobs(prisma: PrismaClient): Promise<void> {
  console.log('\n═══ Demo Jobs Seeder ═══');

  // Resolve creator from the real database
  const creator = await resolveCreator(prisma);
  if (creator) {
    console.log(`  Creator: ${creator.username} (${creator.id})`);
  } else {
    console.warn('  ⚠ No active user found — jobs will have no createdById.');
  }

  // Ensure org structure from real database
  console.log('  Ensuring departments...');
  const deptMap = await ensureDepartments(prisma);
  console.log(`  ✓ ${deptMap.size} departments ready.`);

  console.log('  Ensuring positions...');
  const posMap = await ensurePositions(prisma, deptMap);
  console.log(`  ✓ ${posMap.size} positions ready.`);

  // Seed jobs
  console.log('  Creating jobs...');
  let created = 0;
  let skipped = 0;

  for (const job of DEMO_JOBS) {
    const deptId = deptMap.get(job.departmentName);
    const posId = posMap.get(job.positionTitle);

    if (!deptId || !posId) {
      console.warn(`    ⚠ Skipping "${job.title}" — missing dept/position mapping.`);
      skipped++;
      continue;
    }

    // Idempotent: skip if slug already exists
    const existing = await prisma.job.findUnique({
      where: { slug: job.slug },
      select: { id: true },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + job.applicationDeadlineDays);

    await prisma.job.create({
      data: {
        title: job.title,
        slug: job.slug,
        departmentId: deptId,
        positionId: posId,
        description: job.description,
        summary: job.summary,
        experienceLevel: job.experienceLevel as any,
        contractType: job.contractType as any,
        employmentType: job.employmentType as any,
        workLocationType: job.workLocationType as any,
        city: job.city,
        country: job.country,
        openings: job.openings,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        salaryMode: job.salaryMode as any,
        benefits: job.benefits,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
        responsibilities: job.responsibilities,
        tools: job.tools,
        creatorIsHr: true,
        hiringManagerId: creator?.id ?? null,
        createdById: creator?.id ?? null,
        applicationDeadline: deadline,
        publishedAt: new Date(),
      },
    });

    created++;
    console.log(`    ✓ ${job.title}`);
  }

  console.log(`  Done: ${created} created, ${skipped} skipped.`);
  console.log('═══════════════════════\n');
}
