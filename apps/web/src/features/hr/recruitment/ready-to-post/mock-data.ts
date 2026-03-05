import type { JobPostItem } from "@/features/hr/recruitment/ready-to-post/types";

export const readyToPostJobs: JobPostItem[] = [
  {
    id: "rtp-1",
    title: "Marketing Manager",
    levelTag: "Senior",
    department: "digital_marketing",
    employmentType: "Full-time",
    location: "Nairobi, Kenya (Hybrid)",
    team: "Growth & Performance",
    salaryRange: "KES 320,000 - 420,000 / month",
    positions: 1,
    jobOverview:
      "We are hiring a Marketing Manager to lead acquisition and brand strategy across digital channels, with a focus on measurable growth and campaign quality.",
    requirements: [
      "7+ years in B2B/B2C performance marketing",
      "Hands-on campaign management across paid and owned channels",
      "Strong analytical and attribution modeling skills",
      "Experience leading a multi-disciplinary team",
    ],
    responsibilities: [
      "Own quarterly marketing strategy and budget allocation",
      "Lead campaign lifecycle from planning to reporting",
      "Partner with sales and product on GTM initiatives",
      "Mentor and scale the performance marketing team",
    ],
    benefits: [
      "Medical insurance + wellness stipend",
      "Hybrid work flexibility",
      "Annual performance bonus",
      "Learning and certification budget",
    ],
    priority: "high",
    requisitionId: "REQ-2104",
    dueDate: "Mar 20, 2026",
    expectedDate: "Apr 08, 2026",
  },
  {
    id: "rtp-2",
    title: "Senior Frontend Developer",
    levelTag: "Senior",
    department: "technical",
    employmentType: "Full-time",
    location: "Nairobi, Kenya (Hybrid)",
    team: "Product Engineering",
    salaryRange: "KES 380,000 - 520,000 / month",
    positions: 1,
    jobOverview:
      "We are looking for a Senior Frontend Developer to architect and ship polished product experiences across the BLIH web platform.",
    requirements: [
      "5+ years with React and TypeScript in production systems",
      "Strong UI architecture and component-system experience",
      "Performance optimization and accessibility best practices",
      "Ability to mentor engineers and drive code quality",
    ],
    responsibilities: [
      "Build and maintain scalable frontend modules",
      "Lead design-to-code implementation quality",
      "Collaborate with product and design on feature scope",
      "Improve performance, observability, and developer experience",
    ],
    benefits: [
      "Comprehensive medical cover",
      "Home office and internet allowance",
      "Quarterly engineering innovation days",
      "Career growth framework and mentorship",
    ],
    priority: "high",
    requisitionId: "REQ-2105",
    dueDate: "Mar 25, 2026",
    expectedDate: "Apr 15, 2026",
  },
];

export const emptyReadyToPostMessage = "No jobs ready for post.";
