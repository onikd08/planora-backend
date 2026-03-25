import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../../generated/prisma/enums";
import { ICreateAdmin } from "./user.interface";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";


const createAdmin = async (payload: ICreateAdmin) => {
    const {email, password, ...otherData} = payload;

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
            role: UserRole.ADMIN,
        },
    });

    return result;
}

export const UserService = {
    createAdmin
}