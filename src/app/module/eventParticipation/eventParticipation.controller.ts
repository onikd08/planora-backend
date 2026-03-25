import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { EventParticipationService } from "./eventParticipation.service";
import AppError from "../../errorHelpers/AppError";

const joinEvent = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }

    const result = await EventParticipationService.joinEvent(req.user.id as string, req.body.eventId);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Successfully joined the event",
        data: result,
    });
});

const getMyParticipations = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }

    const result = await EventParticipationService.getMyParticipations(req.user.id as string);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Participations fetched successfully",
        data: result,
    });
});

export const EventParticipationController = {
    joinEvent,
    getMyParticipations
}
