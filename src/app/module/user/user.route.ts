import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-admin", auth(UserRole.ADMIN), UserController.createAdmin);

export const UserRoutes = router