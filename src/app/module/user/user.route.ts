import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";

const router = Router();

router.post("/create-admin", auth(UserRole.ADMIN), validateRequest(UserValidation.createAdminValidation), UserController.createAdmin);
router.put("/update-profile", auth(UserRole.USER, UserRole.ADMIN), validateRequest(UserValidation.updateProfileValidation), UserController.updateProfile);
router.get("/", auth(UserRole.ADMIN, UserRole.USER), UserController.getAllUsers);
router.put("/update-status/:id", auth(UserRole.ADMIN), UserController.updateStatus);
router.get("/my-profile", auth(UserRole.ADMIN, UserRole.USER), UserController.getMyProfile);
router.get("/:id", auth(UserRole.ADMIN, UserRole.USER), UserController.getUserById);



export const UserRoutes = router;