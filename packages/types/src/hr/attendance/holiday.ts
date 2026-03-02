export interface CreateHolidayDto {
  name: string;
  date: string;
  countryId?: string | null;
  isRecurringAnnual?: boolean;
}

export interface UpdateHolidayDto {
  name?: string;
  date?: string;
  countryId?: string | null;
  isRecurringAnnual?: boolean;
}

export interface HolidayResponseDto {
  id: string;
  name: string;
  date: string;
  countryId: string | null;
  isRecurringAnnual: boolean;
  createdAt: string;
  updatedAt: string;
}
