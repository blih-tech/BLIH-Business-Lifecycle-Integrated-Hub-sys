'use client';

import { useState } from 'react';

import { EventCard } from '@/features/hr/people/events/components';
import {
  peopleEventCategories,
  peopleEvents,
} from '@/features/hr/people/events/mock-data';
import type { PeopleEventCategory } from '@/features/hr/people/events/types';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const categoryBackgrounds: Record<
  PeopleEventCategory,
  { overlayClass: string; image?: string; imageClass?: string }
> = {
  birthdays: {
    overlayClass: 'bg-primary/10',
    image:
      'https://www.figma.com/api/mcp/asset/384fa4d0-81f4-40fc-a3ff-04b1e2aed729',
    imageClass: 'object-cover opacity-35',
  },
  'work-anniversaries': {
    overlayClass: 'bg-card',
    image:
      'https://www.figma.com/api/mcp/asset/4ae47e81-f65b-49b2-9cdf-d82f17c76f9b',
    imageClass: 'object-cover opacity-30',
  },
  'promotion-days': {
    overlayClass: 'bg-[#ffe345]/20',
    image:
      'https://www.figma.com/api/mcp/asset/0816e082-0b17-45c9-bcdf-619ad007047a',
    imageClass: 'object-cover object-center opacity-40',
  },
  holidays: {
    overlayClass: 'bg-card',
    image:
      'https://www.figma.com/api/mcp/asset/af5a650b-aab0-4a60-a4da-e91c83fad4ac',
    imageClass: 'object-contain object-left-bottom opacity-90',
  },
};

export function PeopleEventsContent() {
  const [activeCategory, setActiveCategory] =
    useState<PeopleEventCategory>('birthdays');

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-8 px-4 py-4 md:px-5 md:py-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[18px] font-semibold tracking-[-0.3125px] text-foreground">
            Upcoming Events
          </h1>
          <p className="mt-2 text-sm tracking-[-0.1504px] text-muted-foreground">
            Company celebrations and holidays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {peopleEventCategories.map((category) => {
            const isActive = category.id === activeCategory;
            return (
              <Button
                key={category.id}
                type="button"
                variant="ghost"
                className={cn(
                  'relative h-11 overflow-hidden rounded-[6px] px-6 text-sm font-medium tracking-[-0.1504px] text-foreground',
                  isActive ? 'border border-primary' : 'bg-card hover:bg-muted',
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <span
                  className={cn(
                    'absolute inset-0',
                    categoryBackgrounds[category.id].overlayClass,
                  )}
                  aria-hidden="true"
                />
                {categoryBackgrounds[category.id].image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={categoryBackgrounds[category.id].image}
                    alt=""
                    className={cn(
                      'pointer-events-none absolute inset-0 h-full w-full',
                      categoryBackgrounds[category.id].imageClass,
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative z-10">{category.label}</span>
              </Button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
        {peopleEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </main>
  );
}
