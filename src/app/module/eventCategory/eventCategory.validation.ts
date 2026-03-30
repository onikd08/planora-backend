import { z } from "zod";

const createEventCategoryValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    icon: z.string().min(1, "Icon is required"),
  }),
});

const updateEventCategoryValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    icon: z.string().min(1, "Icon is required"),
  }),
});

export const EventCategoryValidation = {
  createEventCategoryValidation,
  updateEventCategoryValidation,
};
