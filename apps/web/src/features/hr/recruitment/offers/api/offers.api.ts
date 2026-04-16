import { apiClient } from '@/lib/api-client';
import type {
  CreateOfferDto,
  OfferResponseDto,
  RespondOfferDto,
  SendOfferDto,
  UpdateOfferDto,
  WithdrawOfferDto,
} from '@/types';

const OFFERS_BASE = '/hr/recruitment/offers';

export async function createOffer(
  data: CreateOfferDto,
): Promise<OfferResponseDto> {
  return apiClient.post<OfferResponseDto>(OFFERS_BASE, data);
}

export async function updateOffer(
  id: string,
  data: UpdateOfferDto,
): Promise<OfferResponseDto> {
  return apiClient.patch<OfferResponseDto>(`${OFFERS_BASE}/${id}`, data);
}

export async function sendOffer(id: string, data: SendOfferDto): Promise<void> {
  await apiClient.post(`${OFFERS_BASE}/${id}/send`, data);
}

export async function respondToOffer(
  id: string,
  data: RespondOfferDto,
): Promise<void> {
  await apiClient.post(`${OFFERS_BASE}/${id}/respond`, data);
}

export async function withdrawOffer(
  id: string,
  data: WithdrawOfferDto,
): Promise<void> {
  await apiClient.post(`${OFFERS_BASE}/${id}/withdraw`, data);
}
