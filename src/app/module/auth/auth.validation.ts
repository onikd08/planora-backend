import { z } from "zod";

const registerUserValidation = z.object({
    name: z.string(),
    email: z.email(),
    password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
    phone: z.string().optional(),
    gender: z.string().optional(),
    profilePhoto: z.string().optional(),
});

export const AuthValidation = {
    registerUserValidation
}