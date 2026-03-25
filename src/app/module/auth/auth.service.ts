import status from "http-status";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IChangePassword, ICreateUser, ILoginUser } from "./auth.interface";
import bcrypt from "bcrypt";
import tokenUtils from "../../utils/token";

const registerUser = async(payload: ICreateUser) => {
    const {email,password, ...otherData} = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if(isUserExist){
        throw new AppError(status.CONFLICT, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.user.create({
        data: {
            ...otherData,
            email,
            password: hashedPassword,
            role: UserRole.USER,
        },
    });

    if(!result){
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");
    }

    const accessToken = tokenUtils.getAccessToken({
        id: result.id,
        role: result.role,
        email: result.email,
        status: result.status,
        firstName: result.firstName,
        lastName: result.lastName,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        id: result.id,
        role: result.role,
        email: result.email,
        status: result.status,
        firstName: result.firstName,
        lastName: result.lastName,
    });

    const {password: userPassword, ...user} = result;

    return {
        accessToken,
        refreshToken,
        user,
    };

}

const loginUser = async(payload: ILoginUser) => {
    const {email,password} = payload;

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if(!user){
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if(!isPasswordMatched){
        throw new AppError(status.UNAUTHORIZED, "Invalid password");
    }

    if(user.status === UserStatus.BANNED){
        throw new AppError(status.FORBIDDEN, "Your account has been banned");
    }

    const accessToken = tokenUtils.getAccessToken({
        id: user.id,
        role: user.role,
        email: user.email,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        id: user.id,
        role: user.role,
        email: user.email,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
    });

    const {password: userPassword, ...safeUser} = user;

    return {
        accessToken,
        refreshToken,
        user: safeUser,
    };
}

const changePassword = async(userId: string, payload: IChangePassword) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const isPasswordMatched = await bcrypt.compare(payload.oldPassword, user.password);

    if (!isPasswordMatched) {
        throw new AppError(status.UNAUTHORIZED, "Invalid old password");
    }

    if (payload.oldPassword === payload.newPassword) {
        throw new AppError(status.BAD_REQUEST, "New password cannot be same as old password");
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return null;
}

export const AuthService = {
    registerUser,
    loginUser,
    changePassword
}