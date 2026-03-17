"use client";

import { CalendarDays, Download, Eye, Sparkles, Timer } from "lucide-react";

import type { OngoingPipelineCandidate } from "@/features/hr/recruitment/ongoing-recruitment/types";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

type CandidateDetailDialogProps = {
  candidate: OngoingPipelineCandidate | null;
  job?: {
    title: string;
    department: string;
    topMatch?: { matchScore: number };
    employmentType?: string;
    openings?: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getAnswerValue(
  answers: OngoingPipelineCandidate["answers"],
  label: string,
  fallback: Record<string, string>,
) {
  const value = answers.find((answer) => answer.label.toLowerCase() === label.toLowerCase())?.value;
  if (value && value.trim().length > 0) {
    return value;
  }
  return fallback[label] ?? "--";
}

function getFileName(value: string) {
  if (!value) {
    return "Applicant CV.pdf";
  }

  try {
    const cleaned = value.split("?")[0] ?? value;
    const name = cleaned.split("/").pop() ?? "";
    return name ? decodeURIComponent(name) : "Applicant CV.pdf";
  } catch {
    return "Applicant CV.pdf";
  }
}

export function CandidateDetailDialog({ candidate, job, open, onOpenChange }: CandidateDetailDialogProps) {
  const fallbackAnswers: OngoingPipelineCandidate["answers"] = [
    { id: "fallback-1", label: "Due Date", value: "Dec 15, 2024", type: "date" },
    { id: "fallback-2", label: "Expected Date", value: "Dec 15, 2024", type: "date" },
    { id: "fallback-3", label: "Full Name", value: "Jessica David Parker", type: "text" },
    { id: "fallback-4", label: "Email Address", value: "applicant@gmail.com", type: "text" },
    { id: "fallback-5", label: "Years of Experience on the Field", value: "3+", type: "text" },
    { id: "fallback-6", label: "Phone Number", value: "+251 932 94 8382", type: "text" },
    { id: "fallback-7", label: "Salary Expectation", value: "20,000 ETB", type: "number" },
    { id: "fallback-8", label: "Notice Period", value: "7 Days", type: "text" },
    { id: "fallback-9", label: "Portfolio", value: "https://portfolio.example.com/applicant", type: "link" },
    { id: "fallback-10", label: "Link to Portfolio", value: "https://applicant-portfolio.com", type: "link" },
    { id: "fallback-11", label: "Additional Link", value: "https://linkedin.com/applicant", type: "link" },
    { id: "fallback-12", label: "Resume / CV", value: "https://files.example.com/Applicant CV.pdf", type: "file" },
    {
      id: "fallback-13",
      label: "Why Do You Want to Us?",
      value:
        "Develop and maintain full-stack applications using React, Node.js, and cloud infrastructure. Lead technical initiatives and mentor junior developers.",
      type: "textarea",
    },
    {
      id: "fallback-14",
      label: "What makes You a Good Fit?",
      value:
        "Develop and maintain full-stack applications using React, Node.js, and cloud infrastructure. Lead technical initiatives and mentor junior developers.",
      type: "textarea",
    },
  ];

  const answers = candidate?.answers?.length ? candidate.answers : fallbackAnswers;
  const fallbackValues = fallbackAnswers.reduce<Record<string, string>>((acc, answer) => {
    acc[answer.label] = answer.value;
    return acc;
  }, {});
  const dateApplied = candidate?.listedAt ?? "Dec 15, 2024";
  const dueDate = getAnswerValue(answers, "Due Date", fallbackValues);
  const expectedDate = getAnswerValue(answers, "Expected Date", fallbackValues);

  const fullName = getAnswerValue(answers, "Full Name", fallbackValues);
  const email = getAnswerValue(answers, "Email Address", fallbackValues);
  const experience = getAnswerValue(answers, "Years of Experience on the Field", fallbackValues);
  const phone = getAnswerValue(answers, "Phone Number", fallbackValues);
  const salary = getAnswerValue(answers, "Salary Expectation", fallbackValues);
  const noticePeriod = getAnswerValue(answers, "Notice Period", fallbackValues);

  const resumeUrl = getAnswerValue(answers, "Resume / CV", fallbackValues);
  const portfolioUrl = getAnswerValue(answers, "Portfolio", fallbackValues);
  const linkToPortfolio = getAnswerValue(answers, "Link to Portfolio", fallbackValues);
  const additionalLink = getAnswerValue(answers, "Additional Link", fallbackValues);

  const whyJoin = getAnswerValue(answers, "Why Do You Want to Us?", fallbackValues);
  const goodFit = getAnswerValue(answers, "What makes You a Good Fit?", fallbackValues);

  const jobTitle = job?.title ?? "Marketing Manager";
  const jobDepartment = job?.department ?? "Digital Marketing Dept.";
  const matchScore = job?.topMatch?.matchScore ?? candidate?.aiAnalysis.score ?? 87;
  const employmentType = job?.employmentType ?? "Full-time";
  const openings = job?.openings ?? 1;
  const showSeniorBadge = jobTitle.toLowerCase().includes("senior");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-[900px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Applicant Detail</DialogTitle>
          <DialogDescription>Applicant details, documents, and actions.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-black">{jobTitle}</p>
                {showSeniorBadge ? (
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-semibold text-primary">
                    Senior
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#666]">
                <span className="text-primary">{jobDepartment}</span>
                <span className="h-1 w-1 rounded-full bg-[#c7c7c7]" />
                <span>{employmentType}</span>
                <span className="h-1 w-1 rounded-full bg-[#c7c7c7]" />
                <span>{openings} Position</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[12px] border border-primary/20 bg-primary/5 px-4 py-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Top Match
              </span>
              <span className="text-sm font-semibold text-primary">{matchScore}%</span>
            </div>
          </div>

          <div className="grid gap-4 rounded-[12px] border border-[#e5e5e5] bg-[#efefef] px-4 py-3 text-sm text-black sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Date Applied</p>
              <p className="font-semibold">{dateApplied}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Due Date</p>
              <p className="font-semibold">{dueDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Expected Date</p>
              <p className="font-semibold">{expectedDate}</p>
            </div>
          </div>

          <div className="grid gap-4 border-b border-[#e5e5e5] pb-6 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Full Name</p>
              <p className="mt-2 text-base font-semibold leading-6 text-black">{fullName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Email Address</p>
              <p className="mt-2 text-base font-semibold leading-6 text-black">{email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Years of Experience on the Field</p>
              <p className="mt-2 text-base font-semibold leading-6 text-black">{experience}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Phone Number</p>
              <p className="mt-2 text-base font-semibold leading-6 text-black">{phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Salary Expectation</p>
              <p className="mt-2 text-base font-semibold leading-6 text-black">{salary}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#666]">Notice Period</p>
              <p className="mt-2 text-base font-semibold leading-6 text-black">{noticePeriod}</p>
            </div>
          </div>

          <div className="grid gap-6 border-b border-[#e5e5e5] pb-6 text-sm sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs text-[#666]">CV and Resume</p>
              <div className="flex items-center justify-between border border-[#e5e5e5] bg-transparent px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/5 text-primary">
                    <span className="text-xs font-semibold">CV</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">{getFileName(resumeUrl)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none bg-[#efefef] text-primary hover:bg-[#e6e6e6]"
                  >
                    <a href={resumeUrl} target="_blank" rel="noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none bg-[#efefef] text-primary hover:bg-[#e6e6e6]"
                  >
                    <a href={resumeUrl} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#666]">Portfolio</p>
              <div className="flex items-center justify-between border border-[#e5e5e5] bg-transparent px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/5 text-primary">
                    <span className="text-xs font-semibold">CV</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">{getFileName(portfolioUrl)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none bg-[#efefef] text-primary hover:bg-[#e6e6e6]"
                  >
                    <a href={portfolioUrl} target="_blank" rel="noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none bg-[#efefef] text-primary hover:bg-[#e6e6e6]"
                  >
                    <a href={portfolioUrl} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-[#666]">Link to Portfolio</p>
              <p className="bg-[#f2f2f2] px-3 py-2 text-sm font-semibold text-black">{linkToPortfolio}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[#666]">Additional Link</p>
              <p className="bg-[#f2f2f2] px-3 py-2 text-sm font-semibold text-black">{additionalLink}</p>
            </div>
          </div>

          <div className="space-y-4 border-b border-[#e5e5e5] pb-6">
            <div className="space-y-2">
              <p className="text-xs text-[#666]">Why Do You Want to Us?</p>
              <div className="bg-[#f2f2f2] px-4 py-4">
                <p className="text-sm text-black">{whyJoin}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[#666]">What makes You a Good Fit?</p>
              <div className="bg-[#f2f2f2] px-4 py-4">
                <p className="text-sm text-black">{goodFit}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Button className="h-11 w-full">Shortlist</Button>
            <Button variant="outline" className="h-11 w-full gap-2 text-primary">
              <CalendarDays className="h-4 w-4" />
              Set Interview
            </Button>
            <Button variant="outline" className="h-11 w-full border-red-500 text-red-500">
              <Timer className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
