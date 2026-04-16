'use client';

import { respondToOffer } from '@/features/hr/recruitment/offers/api/offers.api';
import { Button } from '@/shared/components/ui/button';

type OfferResponseProps = {
  offerId: string;
};

export function OfferResponse({
  offerId,
}: OfferResponseProps): React.ReactElement {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={() => void respondToOffer(offerId, { decision: 'ACCEPTED' })}
      >
        Accept
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => void respondToOffer(offerId, { decision: 'DECLINED' })}
      >
        Decline
      </Button>
    </div>
  );
}
