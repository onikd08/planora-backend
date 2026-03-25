import { Router } from "express";
import { EventParticipationController } from "./eventParticipation.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { EventParticipationValidation } from "./eventParticipation.validation";

const router = Router();

router.post("/join", auth(UserRole.USER, UserRole.ADMIN), validateRequest(EventParticipationValidation.createParticipationValidation), EventParticipationController.joinEvent);
router.get("/my-events", auth(UserRole.USER, UserRole.ADMIN), EventParticipationController.getMyParticipations);

export const EventParticipationRoutes = router;
