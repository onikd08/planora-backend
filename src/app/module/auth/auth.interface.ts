import { GENDER } from "../../../generated/prisma/enums";

export interface ICreateUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    gender?: GENDER;
    profilePhoto?: string;
}

export interface ILoginUser {
    email: string;
    password: string;
}

export interface IChangePassword {
    oldPassword: string;
    newPassword: string;
}