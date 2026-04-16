'use client';

import { useOffers } from '@/features/hr/recruitment/requests/hooks';

type OfferManagementProps = {
  jobId?: string;
};

export function OfferManagement({
  jobId,
}: OfferManagementProps): React.ReactElement {
  const { data, isLoading, isError } = useOffers(jobId);

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading offers...</p>;
  if (isError)
    return <p className="text-sm text-destructive">Failed to load offers.</p>;

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">Offer Management</h3>
      <p className="text-sm text-muted-foreground">
        Offers: {data?.length ?? 0}
      </p>
    </div>
  );
}
