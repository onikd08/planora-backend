import { GENDER } from "../../../generated/prisma/enums";

export interface ICreateAdmin {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    gender?: GENDER;
    profilePhoto?: string;
}

export interface IUpdateProfile {
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: GENDER;
    profilePhoto?: string;
}
