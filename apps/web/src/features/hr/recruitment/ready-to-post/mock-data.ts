import { jobRequests } from "@/features/hr/recruitment/requests/mock-data";
import type { ReadyToPostJob } from "@/features/hr/recruitment/ready-to-post/types";

export const readyToPostJobs: ReadyToPostJob[] = jobRequests;

export const emptyReadyToPostMessage = "No jobs ready for post.";
