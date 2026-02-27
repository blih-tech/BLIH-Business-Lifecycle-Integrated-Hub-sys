import type { JobPostItem } from "@/features/hr/recruitment/ready-to-post/types";

export const readyToPostJobs: JobPostItem[] = [
  {
    id: "rtp-1",
    title: "Marketing Manager",
    levelTag: "Senior",
    department: "digital_marketing",
    employmentType: "Full-time",
    positions: 1,
    jobOverview:
      "We're looking for an experienced Frontend Developer to join our team and help build the next generation of our product platform.",
    requirements: [
      "7+ years in marketing",
      "Experience with digital marketing",
      "Strong analytical skills",
      "Team leadership experience",
    ],
    priority: "high",
    requisitionId: "REQ-0002",
    dueDate: "Dec 15, 2024",
    expectedDate: "Dec 18, 2024",
  },
  {
    id: "rtp-2",
    title: "Senior Frontend Developer",
    department: "technical",
    employmentType: "Full-time",
    positions: 1,
    jobOverview:
      "We're looking for an experienced Frontend Developer to join our team and help build the next generation of our product platform.",
    requirements: [
      "7+ years in marketing",
      "Experience with digital marketing",
      "Strong analytical skills",
      "Team leadership experience",
    ],
    priority: "high",
    requisitionId: "REQ-0002",
    dueDate: "Dec 15, 2024",
    expectedDate: "Dec 18, 2024",
  },
];

export const emptyReadyToPostMessage = "No jobs ready for post.";
