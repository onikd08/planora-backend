import { prisma } from "../../lib/prisma";

import {
  ParticipationStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";

import Stripe from "stripe";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existingPayment) {
    console.log("Payment already processed for this participation");
    return {
      message: "Payment already processed for this participation. Skipping...",
    };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const participationId = session.metadata?.participationId;
      const paymentId = session.metadata?.paymentId;

      if (!participationId || !paymentId) {
        console.error("Missing metadata");
        return {
          message: "Missing metadata",
        };
      }

      const participation = await prisma.eventParticipation.findUnique({
        where: { id: participationId },
        include: { payment: true },
      });

      if (!participation) {
        console.error("Participation not found");
        return {
          message: "Participation not found",
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.eventParticipation.update({
          where: { id: participationId },
          data: {
            participationStatus:
              session.payment_status === "paid"
                ? ParticipationStatus.CONFIRMED
                : ParticipationStatus.PENDING,
          },
        });

        await tx.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.PENDING,
            stripeEventId: event.id,
            paymentGatewayData: session as object,
          },
        });
      });
      console.log(
        `Payment confirmed successfully for participation ${participationId} and payment ${paymentId}`,
      );
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `Checkout session expired for session ${session.id}. Marking associated payment as failed`,
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object as Stripe.PaymentIntent;
      console.log(
        `Payment intent failed for session ${session.id}. Marking associated payment as failed`,
      );
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return {
    message: `Webhook event ${event.id} handled successfully`,
  };
};

export const PaymentService = {
  handleStripeWebhookEvent,
};
