import { z } from 'zod';

const createEventValidation = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        imageURL: z.string().optional(),
        startTime: z.string().min(1, 'Start time is required'),
        endTime: z.string().min(1, 'End time is required'),
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().min(1, 'End date is required'),
        country: z.string().min(1, 'Country is required'),
        city: z.string().min(1, 'City is required'),
        address: z.string().min(1, 'Address is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
        fee: z.number({ message: 'Fee is required' }),
        capacity: z.number({ message: 'Capacity is required' }),
        categoryId: z.string().min(1, 'Category ID is required'),
    }),
});

export const EventValidation = {
    createEventValidation,
};
