import { Router } from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.post("/", auth(UserRole.USER, UserRole.ADMIN), validateRequest(ReviewValidation.createReviewValidation), ReviewController.createReview);
router.get("/event/:eventId", ReviewController.getEventReviews);

export const ReviewRoutes = router;
