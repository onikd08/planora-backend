import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { ICreateAdmin, IUpdateProfile } from "./user.interface";
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

    const {password: userPassword, ...admin} = result;

    return admin;
}

const getAllUsers = async () => {
    const users = await prisma.user.findMany();

    return users.map(user => {
        const {password: userPassword, ...safeUser} = user;
        return safeUser;
    });
}

const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },  
    });

    if(!user){
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const {password: userPassword, ...safeUser} = user;

    return safeUser;
}

const updateProfile = async (id: string, payload: IUpdateProfile) => {
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: payload,
    });

    if(!user){
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const {password: userPassword, ...safeUser} = user;

    return safeUser;
}

const updateStatus = async (id: string) => {
   const user = await prisma.user.findUnique({
    where: {
        id,
    }
   })

   if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found")
   }

   if(user.role === UserRole.ADMIN){
    throw new AppError(status.FORBIDDEN, "Admin cannot be banned");
   }

   const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.BANNED : UserStatus.ACTIVE;

   const result = await prisma.user.update({
    where: {
        id,
    },
    data: {
        status: newStatus,
    },
   })

   const {password: userPassword, ...safeUser} = result;

   return safeUser;
}

const getMyProfile = async(id: string)=>{
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    })

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const {password: userPassword, ...safeUser} = user;

    return safeUser;
}

export const UserService = {
    createAdmin,
    getAllUsers,
    getUserById,
    updateProfile,
    updateStatus,
    getMyProfile
}