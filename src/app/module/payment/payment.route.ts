import { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { PaymentValidation } from "./payment.validation";

const router = Router();

// Step 1: Create a Stripe PaymentIntent — returns clientSecret for Stripe.js
router.post(
    "/intent",
    auth(UserRole.USER, UserRole.ADMIN),
    validateRequest(PaymentValidation.createPaymentIntentValidation),
    PaymentController.createPaymentIntent
);

// Step 2: After Stripe.js confirms payment, call this endpoint to record it
router.post(
    "/confirm",
    auth(UserRole.USER, UserRole.ADMIN),
    validateRequest(PaymentValidation.confirmPaymentValidation),
    PaymentController.confirmPayment
);

// Get payment details by participation ID
router.get(
    "/participation/:participationId",
    auth(UserRole.USER, UserRole.ADMIN),
    PaymentController.getPaymentByParticipation
);

export const PaymentRoutes = router;
