export interface ICreatePaymentIntent {
    participationId: string;
}

export interface IConfirmPayment {
    paymentIntentId: string;
    participationId: string;
}
