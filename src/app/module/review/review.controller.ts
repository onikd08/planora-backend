import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReviewService } from "./review.service";
import AppError from "../../errorHelpers/AppError";

const createReview = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }

    const result = await ReviewService.createReview(req.user.id as string, req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Review submitted successfully",
        data: result,
    });
});

const getEventReviews = catchAsync(async (req, res) => {
    const result = await ReviewService.getEventReviews(req.params.eventId as string);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Reviews fetched successfully",
        data: result,
    });
});

export const ReviewController = {
    createReview,
    getEventReviews
}
