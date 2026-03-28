export const EventSearchableFields = [
  "title",
  "description",
  "country",
  "city",
  "address",
  "postalCode",
];

export const EVENT_STATUS = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type TEventStatus = keyof typeof EVENT_STATUS;
