import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";
import AppError from "../../errorHelpers/AppError";

const createAdmin = catchAsync(async (req, res) => {
    const result = await UserService.createAdmin(req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Admin created successfully",
        data: result,
    });
});

const updateStatus = catchAsync(async (req, res) => {
    const result = await UserService.updateStatus(req.params.id as string);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: `User ${result.status === UserStatus.BANNED ? "banned" : "unbanned"} successfully`,
        data: result,
    });
});

const getAllUsers = catchAsync(async (req, res) => {
    const result = await UserService.getAllUsers();
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
});

const getUserById = catchAsync(async (req, res) => {
    const result = await UserService.getUserById(req.params.id as string);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});

const updateProfile = catchAsync(async (req, res) => {
    if(!req.user){
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const result = await UserService.updateProfile(req.user.id as string, req.body);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});

export const UserController = {
    createAdmin,
    updateStatus,
    getAllUsers,
    getUserById,
    updateProfile
}