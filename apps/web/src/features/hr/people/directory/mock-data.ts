import type { DirectoryEmployee } from "@/features/hr/people/directory/types";

const overviewText =
  "Develop and maintain full-stack applications using React, Node.js, and cloud infrastructure. Lead technical initiatives and mentor junior developers.";

const baseDirectoryEmployees: DirectoryEmployee[] = [
  {
    id: "emp-001",
    initials: "JP",
    name: "Jessica Parker",
    role: "Full Stack Developer",
    department: "Marketing",
    email: "alexg@gmail.com",
    phone: "+251 922 76 6767",
    rank: 90,
    location: "Addis Ababa",
    startDate: "Dec 30, 2025",
    jobType: "Full-time",
    workHours: "40 hrs/wk",
    salary: "15,000",
    roleOverview: overviewText,
    technicalDepartmentLabel: "TECHNICAL DEPT.",
  },
  {
    id: "emp-002",
    initials: "AS",
    name: "Ari Samuelsen",
    role: "Backend Engineer",
    department: "Marketing",
    email: "arisa@gmail.com",
    phone: "+251 911 11 2222",
    rank: 92,
    location: "Addis Ababa",
    startDate: "Jan 10, 2025",
    jobType: "Full-time",
    workHours: "40 hrs/wk",
    salary: "17,000",
    roleOverview: overviewText,
    technicalDepartmentLabel: "TECHNICAL DEPT.",
  },
  {
    id: "emp-003",
    initials: "LB",
    name: "Lana Brooks",
    role: "UI Engineer",
    department: "Marketing",
    email: "lana@gmail.com",
    phone: "+251 933 44 5555",
    rank: 89,
    location: "Addis Ababa",
    startDate: "Feb 15, 2025",
    jobType: "Full-time",
    workHours: "40 hrs/wk",
    salary: "14,500",
    roleOverview: overviewText,
    technicalDepartmentLabel: "TECHNICAL DEPT.",
  },
  {
    id: "emp-004",
    initials: "MC",
    name: "Miles Clark",
    role: "Mobile Developer",
    department: "Marketing",
    email: "miles@gmail.com",
    phone: "+251 944 77 8888",
    rank: 88,
    location: "Adama",
    startDate: "Mar 03, 2025",
    jobType: "Contract",
    workHours: "36 hrs/wk",
    salary: "13,800",
    roleOverview: overviewText,
    technicalDepartmentLabel: "TECHNICAL DEPT.",
  },
  {
    id: "emp-005",
    initials: "RT",
    name: "Rena Thomas",
    role: "QA Engineer",
    department: "Marketing",
    email: "rena@gmail.com",
    phone: "+251 955 00 1111",
    rank: 91,
    location: "Bahir Dar",
    startDate: "Apr 19, 2025",
    jobType: "Full-time",
    workHours: "40 hrs/wk",
    salary: "14,000",
    roleOverview: overviewText,
    technicalDepartmentLabel: "TECHNICAL DEPT.",
  },
  {
    id: "emp-006",
    initials: "JW",
    name: "Janice White",
    role: "Data Analyst",
    department: "Marketing",
    email: "janice@gmail.com",
    phone: "+251 966 22 3333",
    rank: 87,
    location: "Addis Ababa",
    startDate: "May 12, 2025",
    jobType: "Part-time",
    workHours: "30 hrs/wk",
    salary: "11,800",
    roleOverview: overviewText,
    technicalDepartmentLabel: "TECHNICAL DEPT.",
  },
  {
    id: "emp-007",
    initials: "SA",
    name: "Sergio Alvarez",
    role: "DevOps Engineer",
    department: "Marketing",
    email: "sergio@gmail.com",
    phone: "+251 977 99 0000",
    rank: 94,
    location: "Hawassa",
    startDate: "Jun 01, 2025",
    jobType: "Full-time",
    workHours: "40 hrs/wk",
    salary: "18,300",
    roleOverview: overviewText,
    technicalDepartmentLabel: "TECHNICAL DEPT.",
  },
  {
    id: "emp-008",
    initials: "AT",
    name: "Ava Turner",
    role: "Product Designer",
    department: "Marketing",
    email: "ava@gmail.com",
    phone: "+251 988 66 7777",
    rank: 90,
    location: "Addis Ababa",
    startDate: "Jul 14, 2025",
    jobType: "Full-time",
    workHours: "40 hrs/wk",
    salary: "15,400",
    roleOverview: overviewText,
    technicalDepartmentLabel: "TECHNICAL DEPT.",
  },
];

const nameSuffixes = ["II", "III", "IV"];
const generatedEmployees: DirectoryEmployee[] = Array.from({ length: 24 }, (_, index) => {
  const template = baseDirectoryEmployees[(index + 1) % baseDirectoryEmployees.length]!;
  const numericId = index + 9;
  const suffix = nameSuffixes[Math.floor(index / baseDirectoryEmployees.length)] ?? "V";
  const emailLocalPart = template.name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
  const phoneTail = String(10000000 + numericId).slice(-8);

  return {
    ...template,
    id: `emp-${String(numericId).padStart(3, "0")}`,
    name: `${template.name} ${suffix}`,
    email: `${emailLocalPart}${numericId}@gmail.com`,
    phone: `+251 9${phoneTail}`,
    rank: Math.max(84, Math.min(98, template.rank + ((index % 5) - 2))),
  };
});

export const directoryEmployees: DirectoryEmployee[] = [
  ...baseDirectoryEmployees,
  ...generatedEmployees,
];

export const weeklyPerformanceChartImage =
  "https://www.figma.com/api/mcp/asset/14e5e39b-b305-41fa-96af-56f5e8a3ec95";
