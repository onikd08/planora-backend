import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const joinEvent = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUnique({
        where: { id: eventId }
    });

    if (!event) {
        throw new AppError(status.NOT_FOUND, "Event not found");
    }

    const existingParticipation = await prisma.eventParticipation.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId
            }
        }
    });

    if(event.capacity === 0){
        throw new AppError(status.BAD_REQUEST, "Event is full");
    }

    if (existingParticipation) {
        throw new AppError(status.CONFLICT, "Already joined this event");
    }

    const result = await prisma.$transaction(async (tx) => {
        const participation = await tx.eventParticipation.create({
            data: {
                userId,
                eventId
            }
        });

        return participation;
    });

    return result;
}

const getMyParticipations = async (userId: string) => {
    const participations = await prisma.eventParticipation.findMany({
        where: { userId },
        include: {
            event: true
        }
    });
    return participations;
}

export const EventParticipationService = {
    joinEvent,
    getMyParticipations
}
