import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import AppError from "../../errorHelpers/AppError";
import { Request, Response } from "express";
import envVars from "../../../config/env";
import { stripe } from "../../lib/stripe";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.log("Missing stripe signature or webhook secret");
      return res.status(status.BAD_REQUEST).json({
        message: "Missing stripe signature or webhook secret",
      });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (error) {
      console.log("Error constructing webhook event", error);
      return res.status(status.BAD_REQUEST).json({
        message: "Error constructing webhook event",
      });
    }

    try {
      const result = await PaymentService.handleStripeWebhookEvent(event);
      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Webhook event handled successfully",
        data: result,
      });
    } catch (error) {
      console.log("Error handling webhook event", error);
      return res.status(status.BAD_REQUEST).json({
        message: "Error handling webhook event",
      });
    }
  },
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
