import { Router } from "express";
import { UserRoutes } from "../module/user/user.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { EventCategoryRoutes } from "../module/eventCategory/eventCategory.route";
import { EventRoutes } from "../module/event/event.route";
import { EventParticipationRoutes } from "../module/eventParticipation/eventParticipation.route";
import { ReviewRoutes } from "../module/review/review.route";

const router = Router();

router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/event-categories", EventCategoryRoutes);
router.use("/events", EventRoutes);
router.use("/participations", EventParticipationRoutes);
router.use("/reviews", ReviewRoutes);

export const IndexRoutes = router;
