import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { EventService } from "./event.service";
import AppError from "../../errorHelpers/AppError";

const createEvent = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const result = await EventService.createEvent(
    req.user.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Event created successfully",
    data: result,
  });
});

const getAllEvents = catchAsync(async (req, res) => {
  const result = await EventService.getAllEvents();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Events fetched successfully",
    data: result,
  });
});

const getEventById = catchAsync(async (req, res) => {
  const result = await EventService.getEventById(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event fetched successfully",
    data: result,
  });
});

const getMyCreatedEvents = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }
  console.log(req.user);
  const result = await EventService.getMyCreatedEvents(req.user.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "My events fetched successfully",
    data: result,
  });
});

const makeEventFeatured = catchAsync(async (req, res) => {
  const result = await EventService.makeEventFeatured(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event featured successfully",
    data: result,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getEventById,
  getMyCreatedEvents,
  makeEventFeatured,
};
