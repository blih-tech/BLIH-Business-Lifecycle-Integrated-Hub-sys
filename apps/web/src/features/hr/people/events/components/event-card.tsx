'use client';

import Image from 'next/image';

import type { PeopleEvent } from '@/features/hr/people/events/types';
import { cn } from '@/shared/lib/utils';

type EventCardProps = {
  event: PeopleEvent;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="flex w-full flex-col gap-4">
      <div
        className={cn(
          'relative flex h-[214px] items-center justify-center overflow-hidden rounded-[12px] p-4',
          event.type === 'promotion'
            ? 'bg-[#fff8d2]'
            : event.type === 'holiday'
              ? 'bg-card'
              : 'bg-card',
        )}
      >
        {event.backgroundImage ? (
          <Image
            src={event.backgroundImage}
            alt=""
            fill
            className={cn(
              'pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40',
              event.type === 'birthday' ? 'opacity-55' : 'opacity-35',
            )}
          />
        ) : null}

        {event.type === 'holiday' ? (
          <>
            <div className="absolute left-4 top-4 flex w-[calc(100%-2rem)] items-start justify-between">
              <p className="text-[16px] font-medium leading-4 tracking-[-0.3125px] text-foreground">
                {event.name}
              </p>
              <p className="text-[54px] font-medium leading-[52px] tracking-[-2.8px] text-foreground">
                {event.monthLabel}
              </p>
            </div>
            <Image
              src={event.coverImage}
              alt=""
              width={112}
              height={120}
              className="pointer-events-none absolute -bottom-2 -left-8 h-[120px] w-[112px] object-cover"
            />
          </>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-6">
            <Image
              src={event.coverImage}
              alt={event.name}
              width={141}
              height={141}
              className="h-[141px] w-[141px] rounded-full object-cover"
            />
            <p className="text-[16px] font-medium tracking-[-0.3125px] text-foreground">
              {event.name}
            </p>
          </div>
        )}
      </div>

      <div className="flex h-[44px] flex-col items-center">
        <p className="text-sm tracking-[-0.1504px] text-muted-foreground">
          {event.subtitle}
        </p>
        <p className="text-[16px] font-medium tracking-[-0.3125px] text-foreground">
          {event.dayLabel}
          <span className="align-top text-[10px] leading-6">{event.daySuffix}</span>
        </p>
      </div>
    </article>
  );
}
