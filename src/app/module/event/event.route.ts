import { Router } from "express";
import { EventController } from "./event.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { EventValidation } from "./event.validation";

const router = Router();

router.post("/", auth(UserRole.ADMIN, UserRole.USER), validateRequest(EventValidation.createEventValidation), EventController.createEvent);
router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getEventById);
router.get("/my-created-events", auth(UserRole.ADMIN, UserRole.USER), EventController.getMyCreatedEvents);

export const EventRoutes = router;
