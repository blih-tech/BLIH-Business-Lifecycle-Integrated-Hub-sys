export type PeopleEventCategory =
  | 'birthdays'
  | 'work-anniversaries'
  | 'promotion-days'
  | 'holidays';

export type PeopleEventType =
  | 'birthday'
  | 'holiday'
  | 'promotion'
  | 'anniversary';

export type PeopleEvent = {
  id: string;
  type: PeopleEventType;
  name: string;
  subtitle: string;
  dayLabel: string;
  daySuffix: string;
  monthLabel?: string;
  coverImage: string;
  backgroundImage?: string;
  accentImage?: string;
};
