import { Router } from "express";
import { EventCategoryController } from "./eventCategory.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { EventCategoryValidation } from "./eventCategory.validation";

const router = Router();

router.post("/", auth(UserRole.ADMIN), validateRequest(EventCategoryValidation.createEventCategoryValidation), EventCategoryController.createCategory);
router.get("/", EventCategoryController.getAllCategories);

export const EventCategoryRoutes = router;
