import { z } from 'zod';

const createParticipationValidation = z.object({
    body: z.object({
        eventId: z.string().min(1, 'Event ID is required'),
    }),
});

export const EventParticipationValidation = {
    createParticipationValidation,
};
