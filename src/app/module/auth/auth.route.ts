import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", validateRequest(AuthValidation.registerUserValidation), AuthController.registerUser);
router.post("/login", validateRequest(AuthValidation.loginUserValidation), AuthController.loginUser);
router.post("/change-password", auth(UserRole.ADMIN, UserRole.USER), validateRequest(AuthValidation.changePasswordValidation), AuthController.changePassword);

export const AuthRoutes = router;