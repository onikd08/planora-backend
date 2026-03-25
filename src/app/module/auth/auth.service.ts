import status from "http-status";
import { UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateUser, ILoginUser } from "./auth.interface";
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

    return {
        accessToken,
        refreshToken,
        user: result,
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

    return {
        accessToken,
        refreshToken,
        user,
    };
}   

export const AuthService = {
    registerUser,
    loginUser
}