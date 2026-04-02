import { GENDER } from "../../../generated/prisma/enums";

export interface IUpdateProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: GENDER;
  profilePhoto?: string;
}
