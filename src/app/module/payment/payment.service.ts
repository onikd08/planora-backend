import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { IConfirmPayment, ICreatePaymentIntent } from "./payment.interface";
import { EVENT_STATUS } from "../event/event.constants";
import { ParticipationStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { stripe } from "../../lib/stripe";

/**
 * Creates a Stripe PaymentIntent.
 * Amount is taken from the event fee to prevent client-side tampering.
 */
const createPaymentIntent = async (payload: ICreatePaymentIntent) => {
    const { participationId } = payload;

    const participation = await prisma.eventParticipation.findUnique({
        where: { id: participationId },
        include: { event: true, payment: true }
    });

    if (!participation) {
        throw new AppError(status.NOT_FOUND, "Participation record not found");
    }

    if(participation.event.capacity === 0){
        throw new AppError(status.BAD_REQUEST, "Event is full");
    }

    if (participation.event.eventStatus !== EVENT_STATUS.UPCOMING) {
        throw new AppError(status.BAD_REQUEST, "You can only pay for upcoming events");
    }



    if (participation.payment?.paymentStatus === PaymentStatus.PAID) {
        throw new AppError(status.BAD_REQUEST, "Payment already processed for this participation");
    }

    const eventFee = participation.event.fee;

    // Free events — no payment needed, auto-confirm
    if (eventFee === 0) {
        await  prisma.$transaction(async(tx)=>{

            await tx.eventParticipation.update({
            where: { id: participationId },
            data: {
                participationStatus: ParticipationStatus.CONFIRMED
            }
        });
            await tx.payment.create({
                data: {
                    participationId,
                    amount: eventFee,
                    transactionId: `FREE_${participationId}`,
                    paymentStatus: PaymentStatus.PAID,
                    paymentGatewayData: {}
                }
            });
            await tx.event.update({
                where: { id: participation.eventId },
                data: {
                    capacity: {
                        decrement: 1
                    }
                }
            });
        })
        return { message: "Free event — participation confirmed automatically" };
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(eventFee * 100), // Stripe requires smallest currency unit
        currency: "usd",
        metadata: { participationId, eventId: participation.eventId },
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "always",
        }
    });

    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: eventFee,
        currency: "usd"
    };
}

/**
 * Confirms a payment by retrieving the PaymentIntent from Stripe and
 * verifying its status. Creates the Payment record and confirms participation.
 */
const confirmPayment = async (payload: IConfirmPayment) => {
    const { paymentIntentId, participationId } = payload;

    // Fetch the PaymentIntent from Stripe to verify its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
        throw new AppError(
            status.BAD_REQUEST,
            `Payment not successful. Stripe status: ${paymentIntent.status}`
        );
    }

    // Verify metadata matches to prevent cross-participation exploits
    if (paymentIntent.metadata.participationId !== participationId) {
        throw new AppError(status.FORBIDDEN, "Payment intent does not match this participation");
    }

    const participation = await prisma.eventParticipation.findUnique({
        where: { id: participationId },
        include: { payment: true }
    });

    if (!participation) {
        throw new AppError(status.NOT_FOUND, "Participation record not found");
    }

    if (participation.payment?.paymentStatus === PaymentStatus.PAID) {
        throw new AppError(status.CONFLICT, "Payment already confirmed for this participation");
    }

    const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
            data: {
                participationId,
                amount: paymentIntent.amount / 100,
                transactionId: paymentIntent.id,
                paymentStatus: PaymentStatus.PAID,
                paymentGatewayData: paymentIntent as object
            }
        });

        await tx.eventParticipation.update({
            where: { id: participationId },
            data: {
                participationStatus: ParticipationStatus.CONFIRMED
            }
        });

        await tx.event.update({
            where: { id: participation.eventId },
            data: {
                capacity: {
                    decrement: 1
                }
            }
        });

        return payment;
    });

    return result;
}

const getPaymentByParticipation = async (participationId: string) => {
    const payment = await prisma.payment.findUnique({
        where: { participationId },
        include: {
            participation: {
                include: { event: true }
            }
        }
    });

    if (!payment) {
        throw new AppError(status.NOT_FOUND, "Payment not found");
    }
    return payment;
}

export const PaymentService = {
    createPaymentIntent,
    confirmPayment,
    getPaymentByParticipation
}
