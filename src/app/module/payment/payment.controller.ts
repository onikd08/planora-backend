import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import AppError from "../../errorHelpers/AppError";

const createPaymentIntent = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const result = await PaymentService.createPaymentIntent(req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Payment intent created successfully",
        data: result,
    });
});

const confirmPayment = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const result = await PaymentService.confirmPayment(req.body);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Payment confirmed successfully",
        data: result,
    });
});

const getPaymentByParticipation = catchAsync(async (req, res) => {
    const result = await PaymentService.getPaymentByParticipation(req.params.participationId as string);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Payment fetched successfully",
        data: result,
    });
});

export const PaymentController = {
    createPaymentIntent,
    confirmPayment,
    getPaymentByParticipation
}
