import { Router } from "express";
import auth from "../../middleware/auth";
import { DashboardController } from "./dashboard.controller";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/user", auth(UserRole.USER), DashboardController.getUserDashboard);
router.get(
  "/admin",
  auth(UserRole.ADMIN),
  DashboardController.getAdminDashboard,
);

export const DashboardRoutes = router;
