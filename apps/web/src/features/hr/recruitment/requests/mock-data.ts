import type {
  FullJobRequest,
  RequestsStatItem,
} from "@/features/hr/recruitment/requests/types";

export const jobRequests: FullJobRequest[] = [
  {
    jobId: "job-mock-1",
    status: "posted",
    progress: {
      jm: { status: "approved" },
      hr: { status: "approved" },
      finance: { status: "approved" },
    },
    requestForm: {
      jobTitle: "Frontend Engineer",
      department: "technical",
      requestedBy: "Alice Njeri",
      position: "frontend_engineer",
      requestType: "NEW",
      replaceFor: "",
      businessJustification:
        "Scale the frontend team for upcoming product launches.",
      employmentType: "FULL_TIME",
      workMode: "HYBRID",
      urgency: "HIGH",
      neededByDate: "2026-04-15",
      priority: "MEDIUM",
      openings: "1",
      createdDate: "2026-03-10",
    },
    jobDetailsForm: {
      title: "Frontend Engineer",
      city: "Nairobi",
      country: "Kenya",
      workLocationType: "HYBRID",
      employmentType: "FULL_TIME",
      description:
        "Build and maintain high-quality user interfaces for our HR platform.",
      summary: "Join a fast-moving product team shipping weekly.",
      responsibilities: "Build React features\nCollaborate with designers",
      requiredSkills: "React\nTypeScript\nCSS Modules",
      preferredSkills: "Next.js\nAccessibility",
      experienceLevel: "MID",
      contractType: "PERMANENT",
      salaryMode: "COMPETITIVE",
      salaryMin: "2500",
      salaryMax: "4000",
      currency: "USD",
      benefits: "Health insurance\nRemote support",
      tools: "Figma\nJira\nGitHub",
      hiringManagerId: "manager-1",
      applicationDeadline: "2026-04-30",
      openings: "1",
    },
    applicationForm: {
      applicantFields: [
        { key: "FIRST_NAME", enabled: true, required: true },
        { key: "LAST_NAME", enabled: true, required: true },
        { key: "EMAIL", enabled: true, required: true },
        { key: "PHONE", enabled: true, required: false },
      ],
      sections: [
        { key: "EDUCATION", enabled: true, required: false },
        { key: "EXPERIENCE", enabled: true, required: false },
      ],
      customFields: [
        {
          id: "custom-1",
          label: "Portfolio URL",
          type: "TEXT",
          required: false,
          helpText: "Share a link to your work.",
          options: [],
        },
      ],
    },
  },
  {
    jobId: "job-mock-2",
    status: "active",
    progress: {
      jm: { status: "pending" },
      hr: { status: "approved" },
      finance: { status: "pending" },
    },
    requestForm: {
      jobTitle: "Product Manager",
      department: "creative",
      requestedBy: "Mercy Wanjiku",
      position: "product_manager",
      requestType: "REPLACEMENT",
      replaceFor: "emp-123",
      businessJustification:
        "Own roadmap execution and cross-functional coordination.",
      employmentType: "FULL_TIME",
      workMode: "ON_SITE",
      urgency: "MEDIUM",
      neededByDate: "2026-05-01",
      priority: "HIGH",
      openings: "1",
      createdDate: "2026-03-12",
    },
    jobDetailsForm: {
      title: "Product Manager",
      city: "Addis Ababa",
      country: "Ethiopia",
      workLocationType: "ON_SITE",
      employmentType: "FULL_TIME",
      description: "Drive product planning and stakeholder alignment.",
      summary: "Build internal HR automation experiences.",
      responsibilities: "Define roadmap\nCoordinate delivery",
      requiredSkills: "Product strategy\nStakeholder management",
      preferredSkills: "Workflow automation",
      experienceLevel: "SENIOR",
      contractType: "PERMANENT",
      salaryMode: "NOT_SPECIFIED",
      salaryMin: "",
      salaryMax: "",
      currency: "",
      benefits: "Medical cover\nLearning budget",
      tools: "Notion\nJira",
      hiringManagerId: "manager-2",
      applicationDeadline: "2026-05-15",
      openings: "1",
    },
    applicationForm: {
      applicantFields: [
        { key: "FIRST_NAME", enabled: true, required: true },
        { key: "LAST_NAME", enabled: true, required: true },
        { key: "EMAIL", enabled: true, required: true },
        { key: "PHONE", enabled: true, required: false },
      ],
      sections: [
        { key: "EDUCATION", enabled: true, required: false },
        { key: "EXPERIENCE", enabled: true, required: true },
      ],
      customFields: [],
    },
  },
];

export const requestStats: RequestsStatItem[] = [
  { id: "rs-1", label: "Pending Requests", value: "12", icon: "pending" },
  { id: "rs-2", label: "Approved This Month", value: "28", icon: "approved" },
  {
    id: "rs-3",
    label: "Total Open Positions",
    value: "45",
    icon: "open_positions",
  },
];

export const emptyRequestsMessage = "No jobs requested.";
