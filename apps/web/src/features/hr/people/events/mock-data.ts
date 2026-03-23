import type {
  PeopleEvent,
  PeopleEventCategory,
} from "@/features/hr/people/events/types";

export const peopleEventCategories: Array<{
  id: PeopleEventCategory;
  label: string;
}> = [
  { id: "birthdays", label: "Birthdays" },
  { id: "work-anniversaries", label: "Work Anniversaries" },
  { id: "promotion-days", label: "Promotion Days" },
  { id: "holidays", label: "Holidays" },
];

export const peopleEvents: PeopleEvent[] = [
  {
    id: "event-1",
    type: "birthday",
    name: "Jessica Parker",
    subtitle: "Happy Birthday Wish",
    dayLabel: "Jan 22",
    daySuffix: "nd",
    coverImage:
      "https://www.figma.com/api/mcp/asset/fb4500f4-6eb8-435b-bbb0-cfd8819ba28a",
    backgroundImage:
      "https://www.figma.com/api/mcp/asset/384fa4d0-81f4-40fc-a3ff-04b1e2aed729",
  },
  {
    id: "event-2",
    type: "holiday",
    name: "February",
    subtitle: "Adwa Victory Day",
    dayLabel: "Feb 28",
    daySuffix: "th",
    monthLabel: "28",
    coverImage:
      "https://www.figma.com/api/mcp/asset/af5a650b-aab0-4a60-a4da-e91c83fad4ac",
  },
  {
    id: "event-3",
    type: "promotion",
    name: "Jessica Parker",
    subtitle: "To Be Promoted",
    dayLabel: "Jan 22",
    daySuffix: "nd",
    coverImage:
      "https://www.figma.com/api/mcp/asset/b95cda48-9a59-4f45-9438-173539dda620",
    backgroundImage:
      "https://www.figma.com/api/mcp/asset/fb226980-146f-496a-80cb-c3e3f1db8b26",
  },
  {
    id: "event-4",
    type: "anniversary",
    name: "Jessica Parker",
    subtitle: "1 Year Anniversary",
    dayLabel: "Jan 22",
    daySuffix: "nd",
    coverImage:
      "https://www.figma.com/api/mcp/asset/88c109c9-37f6-42a4-8f54-bb5f57fa92d1",
    backgroundImage:
      "https://www.figma.com/api/mcp/asset/23689c1f-5503-4b51-88a5-3844e053b282",
  },
];

