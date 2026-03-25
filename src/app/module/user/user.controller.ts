import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";

const createAdmin = catchAsync(async (req, res) => {
    const result = await UserService.createAdmin(req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin created successfully",
        data: result,
    });
});

export const UserController = {
    createAdmin
}