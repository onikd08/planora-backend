import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { uuidv7 } from "zod";
import { stripe } from "../../lib/stripe";
import envVars from "../../../config/env";
import {
  ParticipationStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";

const joinEvent = async (userId: string, eventId: string) => {
  // 1. Initial Checks (Outside Transaction to save resources)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          eventParticipations: { where: { participationStatus: "CONFIRMED" } },
        },
      },
    },
  });

  if (!event) throw new AppError(status.NOT_FOUND, "Event not found");

  // Check capacity against confirmed participations
  if (event._count.eventParticipations >= event.capacity) {
    throw new AppError(status.BAD_REQUEST, "Event is full");
  }

  const existingParticipation = await prisma.eventParticipation.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existingParticipation) {
    throw new AppError(status.CONFLICT, "Already joined this event");
  }

  // handle free events

  if (event.fee === 0) {
    const participation = await prisma.eventParticipation.create({
      data: {
        userId,
        eventId,
        participationStatus: ParticipationStatus.CONFIRMED,
        joinedAt: new Date(),
      },
    });

    return {
      participation,
      payment: null,
      paymentURL: null, // No redirect needed
      message: "Successfully joined the free event!",
    };
  }

  // 2. Database Transaction (ONLY for DB operations)
  const dbResult = await prisma.$transaction(async (tx) => {
    const participation = await tx.eventParticipation.create({
      data: { userId, eventId },
    });

    const paymentData = await tx.payment.create({
      data: {
        participationId: participation.id,
        amount: event.fee,
        transactionId: `TXN-${uuidv7()}`,
      },
    });

    return { participation, paymentData };
  });

  // 3. External API Call (Outside Transaction)
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: event.title },
            unit_amount: Math.round(event.fee * 100), // Secure float handling
          },
          quantity: 1,
        },
      ],
      metadata: {
        participationId: dbResult.participation.id,
        paymentId: dbResult.paymentData.id, // Corrected: passing Payment ID, not Participation ID
      },
      success_url: `${envVars.FRONTEND_URL}/payment/payment-success`,
      cancel_url: `${envVars.FRONTEND_URL}/events/${eventId}`,
    });

    return {
      participation: dbResult.participation,
      payment: dbResult.paymentData,
      paymentURL: session.url,
    };
  } catch (error) {
    // If Stripe fails, the user still has a PENDING record.
    // They can trigger 'initiatePayment' later from their dashboard.
    console.error("Stripe Session Creation Failed:", error);
    return {
      participation: dbResult.participation,
      payment: dbResult.paymentData,
      paymentURL: null, // UI can show a "Retry Payment" button
      error:
        "Payment gateway unavailable, please try again from your dashboard.",
    };
  }
};

const joinEventWithPayLater = async (userId: string, eventId: string) => {
  // 1. Initial Checks (Outside Transaction to save resources)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          eventParticipations: { where: { participationStatus: "CONFIRMED" } },
        },
      },
    },
  });

  if (!event) throw new AppError(status.NOT_FOUND, "Event not found");

  // Check capacity against confirmed participations
  if (event._count.eventParticipations >= event.capacity) {
    throw new AppError(status.BAD_REQUEST, "Event is full");
  }

  const existingParticipation = await prisma.eventParticipation.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existingParticipation) {
    throw new AppError(status.CONFLICT, "Already joined this event");
  }

  const result = await prisma.$transaction(async (tx) => {
    const participation = await tx.eventParticipation.create({
      data: {
        userId,
        eventId,
      },
    });

    const transactionId = `TXN-${uuidv7()}`;
    const paymentData = await tx.payment.create({
      data: {
        participationId: participation.id,
        amount: event.fee,
        transactionId,
      },
    });

    return { participation, payment: paymentData };
  });

  return result;
};

const getMyParticipations = async (userId: string) => {
  const participations = await prisma.eventParticipation.findMany({
    where: { userId },
    include: {
      event: true,
    },
  });
  return participations;
};

const initiatePayment = async (eventParticipationId: string) => {
  const participation = await prisma.eventParticipation.findUniqueOrThrow({
    where: {
      id: eventParticipationId,
    },
    include: {
      user: true,
      payment: true,
      event: true,
    },
  });

  if (!participation.payment) {
    throw new AppError(status.BAD_REQUEST, "Payment not found");
  }

  if (participation.payment.paymentStatus === PaymentStatus.PAID) {
    throw new AppError(
      status.CONFLICT,
      "Payment already processed for this participation",
    );
  }

  if (
    participation.participationStatus === ParticipationStatus.CONFIRMED ||
    participation.participationStatus === ParticipationStatus.CANCELLED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment cannot be initiated for this participation",
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: participation.event.title,
          },
          unit_amount: Math.round(participation.event.fee * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      participationId: participation.id,
      paymentId: participation.payment?.id,
    },
    success_url: `${envVars.FRONTEND_URL}/payment/payment-success`,
    cancel_url: `${envVars.FRONTEND_URL}/events/${participation.eventId}`,
  });

  return {
    paymentURL: session.url,
  };
};

export const EventParticipationService = {
  joinEvent,
  getMyParticipations,
  initiatePayment,
  joinEventWithPayLater,
};
