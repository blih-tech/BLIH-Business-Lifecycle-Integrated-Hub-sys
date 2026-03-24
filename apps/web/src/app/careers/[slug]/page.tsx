import { CareerApplicationForm, getCareerJobBySlug } from '@/features/careers';
import { notFound } from 'next/navigation';

type CareerApplicationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CareerApplicationPage({
  params,
}: CareerApplicationPageProps) {
  const { slug } = await params;
  const job = getCareerJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return <CareerApplicationForm job={job} />;
}
