import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { ICreateReview } from "./review.interface";
import { EVENT_STATUS } from "../event/event.constants";
import { ParticipationStatus } from "../../../generated/prisma/enums";

const createReview = async (userId: string, payload: ICreateReview) => {
    const { eventId, rating, comment } = payload;

    const event = await prisma.event.findUnique({
        where: { id: eventId }
    });

    if (!event) {
        throw new AppError(status.NOT_FOUND, "Event not found");
    }

    // Check if event is completed
    if (event.eventStatus !== EVENT_STATUS.COMPLETED) {
        throw new AppError(status.BAD_REQUEST, "Review can only be given after the event is completed");
    }

    // Check if user participated and is confirmed
    const participation = await prisma.eventParticipation.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId
            }
        }
    });

    if (!participation || participation.participationStatus !== ParticipationStatus.CONFIRMED) {
        throw new AppError(status.FORBIDDEN, "You can only review events you have fully participated in");
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId
            }
        }
    });

    if (existingReview) {
        throw new AppError(status.CONFLICT, "You have already reviewed this event");
    }

    const review = await prisma.review.create({
        data: {
            userId,
            eventId,
            rating,
            comment
        }
    });

    return review;
}

const getEventReviews = async (eventId: string) => {
    const reviews = await prisma.review.findMany({
        where: { eventId },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePhoto: true
                }
            }
        }
    });
    return reviews;
}

export const ReviewService = {
    createReview,
    getEventReviews
}
