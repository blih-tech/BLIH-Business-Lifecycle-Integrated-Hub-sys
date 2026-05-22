import { getCareerJobs, CareersPageContent } from '@/features/careers';

export default async function CareersPage() {
  const jobs = await getCareerJobs();
  return <CareersPageContent jobs={jobs} />;
}
