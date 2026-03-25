import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import cookieUtils from "../../utils/cookie";
import { AuthService } from "./auth.service";
import AppError from "../../errorHelpers/AppError";

const registerUser = catchAsync(async (req, res) => {
    const result = await AuthService.registerUser(req.body);

    cookieUtils.setAccessTokenCookie(res, result.accessToken);
    cookieUtils.setRefreshTokenCookie(res, result.refreshToken);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "User registered successfully",
        data: result,
    });
});

const loginUser = catchAsync(async (req, res) => {
    const result = await AuthService.loginUser(req.body);

    cookieUtils.setAccessTokenCookie(res, result.accessToken);
    cookieUtils.setRefreshTokenCookie(res, result.refreshToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: result,
    });
});

const changePassword = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const result = await AuthService.changePassword(req.user.id as string, req.body);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Password changed successfully",
        data: result,
    });
});

export const AuthController = {
    registerUser,
    loginUser,
    changePassword
}