import { z } from "zod";

const registerUserValidation = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email(),
    password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
    phone: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    profilePhoto: z.string().optional(),
});

const loginUserValidation = z.object({
    email: z.email(),
    password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
});

const changePasswordValidation = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
});

export const AuthValidation = {
    registerUserValidation,
    loginUserValidation,
    changePasswordValidation
}