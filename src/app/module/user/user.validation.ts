import { z } from "zod";

const updateProfileValidation = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    profilePhoto: z.string().optional(),
  }),
});

export const UserValidation = {
  updateProfileValidation,
};
