import type { FullJobRequest, RequestsStatItem } from "@/features/hr/recruitment/requests/types";

export const jobRequests: FullJobRequest[] = [
  {
    status: "pending",
    progress: {
      jm: { status: "approved" },
      hr: { status: "pending" },
      finance: { status: "pending" },
    },
    requestForm: {
      jobTitle: "Senior Software Engineer",
      department: "technical",
      requestedBy: "Alice Njeri",
      position: "backend_engineer",
      requestType: "new",
      replaceFor: "",
      businessJustification:
        "Scale the backend and platform teams to support Q2 product launches and reduce delivery bottlenecks.",
      employmentType: "full_time",
      workMode: "hybrid",
      urgency: "high",
      neededByDate: "2025-03-15",
    },
    jobDetailsForm: {
      jobTitle: "Senior Software Engineer",
      location: "Addis Ababa, Ethiopia",
      workMode: "hybrid",
      employmentType: "full_time",
      jobSummary:
        "Own backend platform delivery and help the engineering team scale critical product systems.",
      whyJoinUs:
        "Work on high-impact systems with a product team shipping quickly across multiple business functions.",
      keyResponsibilities: [
        "Design and maintain backend services",
        "Collaborate with product and frontend teams",
        "Improve system reliability and performance",
      ],
      requirements: ["TypeScript", "Node.js", "System Design", "AWS"],
      preferredSkills: ["Kubernetes", "CI/CD", "Observability"],
      experienceLevel: "senior",
      salaryMode: "range",
      salaryRangeMin: "3000",
      salaryRangeMax: "4200",
      salaryCurrency: "USD",
      benefits: ["Health insurance", "Learning budget", "Hybrid work support"],
    },
    applicationForm: {
      predefinedFields: [
        { key: "full_name", label: "Full Name", type: "text", enabled: true, required: true },
        { key: "email", label: "Email Address", type: "text", enabled: true, required: true },
        { key: "resume", label: "Resume / CV", type: "file", enabled: true, required: true },
      ],
      customFields: [
        {
          id: "cf-1",
          label: "Github Profile",
          type: "text",
          required: false,
          helpText: "",
          options: [],
        },
      ],
    },
  },
  {
    status: "pending",
    progress: {
      jm: {
        status: "requested_review",
        justification: "Clarify ownership scope and budget assumptions.",
      },
      hr: { status: "pending" },
      finance: { status: "pending" },
    },
    requestForm: {
      jobTitle: "Product Manager",
      department: "technical",
      requestedBy: "Mercy Wanjiku",
      position: "product_manager",
      requestType: "replacement",
      replaceFor: "emp-mercy-wanjiku",
      businessJustification:
        "Own roadmap execution for HR automation initiatives and align product delivery across cross-functional teams.",
      employmentType: "full_time",
      workMode: "on_site",
      urgency: "medium",
      neededByDate: "2025-04-01",
    },
    jobDetailsForm: {
      jobTitle: "Product Manager",
      location: "Nairobi, Kenya",
      workMode: "on_site",
      employmentType: "full_time",
      jobSummary:
        "Lead roadmap planning and execution for internal product initiatives across HR and operations.",
      whyJoinUs:
        "Drive visible process transformation and partner with cross-functional teams building internal tools.",
      keyResponsibilities: [
        "Define roadmap priorities",
        "Coordinate delivery across functions",
        "Own product outcomes and adoption",
      ],
      requirements: ["Product Strategy", "Stakeholder Management", "Agile", "Data Analysis"],
      preferredSkills: ["Workflow automation", "SaaS metrics"],
      experienceLevel: "mid",
      salaryMode: "competitive",
      salaryRangeMin: "",
      salaryRangeMax: "",
      salaryCurrency: "",
      benefits: ["Medical cover", "Professional development"],
    },
    applicationForm: {
      predefinedFields: [
        { key: "full_name", label: "Full Name", type: "text", enabled: true, required: true },
        { key: "email", label: "Email Address", type: "text", enabled: true, required: true },
        { key: "resume", label: "Resume / CV", type: "file", enabled: true, required: true },
        { key: "cover_letter", label: "Cover Letter", type: "textarea", enabled: true, required: false },
      ],
      customFields: [],
    },
  },
  {
    status: "posted",
    progress: {
      jm: { status: "approved" },
      hr: { status: "approved" },
      finance: { status: "approved" },
    },
    requestForm: {
      jobTitle: "UI/UX Designer",
      department: "creative",
      requestedBy: "Ian Mwangi",
      position: "ui_ux_designer",
      requestType: "new",
      replaceFor: "",
      businessJustification:
        "Increase design throughput for active product squads and improve consistency in design system adoption.",
      employmentType: "contract",
      workMode: "remote",
      urgency: "low",
      neededByDate: "2025-04-05",
    },
    jobDetailsForm: {
      jobTitle: "UI/UX Designer",
      location: "Remote",
      workMode: "remote",
      employmentType: "contract",
      jobSummary:
        "Design user flows and polished interfaces across product squads and support design system maturity.",
      whyJoinUs:
        "Join a collaborative product team focused on practical user impact and fast iteration.",
      keyResponsibilities: [
        "Create product flows and prototypes",
        "Support research and usability testing",
        "Contribute to the design system",
      ],
      requirements: ["Figma", "Interaction Design", "Design Systems", "User Research"],
      preferredSkills: ["Motion design", "Developer handoff"],
      experienceLevel: "mid",
      salaryMode: "negotiable",
      salaryRangeMin: "",
      salaryRangeMax: "",
      salaryCurrency: "",
      benefits: ["Remote work support", "Learning stipend"],
    },
    applicationForm: {
      predefinedFields: [
        { key: "full_name", label: "Full Name", type: "text", enabled: true, required: true },
        { key: "email", label: "Email Address", type: "text", enabled: true, required: true },
        { key: "resume", label: "Resume / CV", type: "file", enabled: true, required: true },
        { key: "portfolio", label: "Portfolio Link", type: "text", enabled: true, required: true },
      ],
      customFields: [
        {
          id: "cf-2",
          label: "Favorite design system project",
          type: "textarea",
          required: false,
          helpText: "",
          options: [],
        },
      ],
    },
  },
  {
    status: "pending",
    progress: {
      jm: { status: "approved" },
      hr: { status: "approved" },
      finance: {
        status: "rejected",
        justification: "Current quarter budget is fully allocated.",
      },
    },
    requestForm: {
      jobTitle: "Data Analyst",
      department: "digital_marketing",
      requestedBy: "Kevin Kiptoo",
      position: "data_analyst",
      requestType: "new",
      replaceFor: "",
      businessJustification:
        "Strengthen campaign reporting and attribution analysis to improve budget allocation and lead quality.",
      employmentType: "part_time",
      workMode: "remote",
      urgency: "low",
      neededByDate: "2025-03-28",
    },
    jobDetailsForm: {
      jobTitle: "Data Analyst",
      location: "Remote",
      workMode: "remote",
      employmentType: "part_time",
      jobSummary:
        "Support campaign measurement and reporting with clear analysis and operational dashboards.",
      whyJoinUs: "",
      keyResponsibilities: [
        "Track marketing performance",
        "Build campaign dashboards",
        "Support data-driven budget decisions",
      ],
      requirements: ["SQL", "Excel", "Power BI", "Marketing Analytics"],
      preferredSkills: ["Attribution modeling"],
      experienceLevel: "mid",
      salaryMode: "not_specified",
      salaryRangeMin: "",
      salaryRangeMax: "",
      salaryCurrency: "",
      benefits: [],
    },
    applicationForm: {
      predefinedFields: [
        { key: "full_name", label: "Full Name", type: "text", enabled: true, required: true },
        { key: "email", label: "Email Address", type: "text", enabled: true, required: true },
        { key: "resume", label: "Resume / CV", type: "file", enabled: true, required: true },
      ],
      customFields: [
        {
          id: "cf-3",
          label: "Power BI sample link",
          type: "text",
          required: false,
          helpText: "",
          options: [],
        },
      ],
    },
  },
];

export const requestStats: RequestsStatItem[] = [
  { id: "rs-1", label: "Pending Requests", value: "12", icon: "pending" },
  { id: "rs-2", label: "Approved This Month", value: "28", icon: "approved" },
  { id: "rs-3", label: "Total Open Positions", value: "45", icon: "open_positions" },
];

export const emptyRequestsMessage = "No jobs requested.";
