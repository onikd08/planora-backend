import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { DashboardService } from "./dashboard.service";

const getUserDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await DashboardService.getUserDashboardStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: result,
  });
});

const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getAdminDashboardStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin dashboard stats fetched successfully",
    data: result,
  });
});

export const DashboardController = {
  getUserDashboard,
  getAdminDashboard,
};
