import { z } from 'zod';

const createPaymentIntentValidation = z.object({
    body: z.object({
        participationId: z.string().min(1, 'Participation ID is required'),
    }),
});

const confirmPaymentValidation = z.object({
    body: z.object({
        paymentIntentId: z.string().min(1, 'Payment Intent ID is required'),
        participationId: z.string().min(1, 'Participation ID is required'),
    }),
});

export const PaymentValidation = {
    createPaymentIntentValidation,
    confirmPaymentValidation,
};
