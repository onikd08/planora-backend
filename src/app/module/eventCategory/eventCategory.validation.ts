import { z } from 'zod';

const createEventCategoryValidation = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
    }),
});

export const EventCategoryValidation = {
    createEventCategoryValidation,
};
