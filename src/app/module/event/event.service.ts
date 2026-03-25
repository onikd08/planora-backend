import { prisma } from "../../lib/prisma";
import { ICreateEvent } from "./event.interface";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const createEvent = async (creatorId: string, payload: ICreateEvent) => {
    const event = await prisma.event.create({
        data: {
            ...payload,
            startTime: new Date(payload.startTime),
            endTime: new Date(payload.endTime),
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
            creatorId,
        },
    });
    return event;
}

const getAllEvents = async () => {
    const events = await prisma.event.findMany({
        where: {
            isDeleted: false
        },
        include: {
            category: true,
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePhoto: true
                }
            }
        }
    });
    return events;
}

const getEventById = async (id: string) => {
    const event = await prisma.event.findUnique({
        where: {
            id,
            isDeleted: false
        },
        include: {
            category: true,
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePhoto: true
                }
            }
        }
    });

    if (!event) {
        throw new AppError(status.NOT_FOUND, "Event not found");
    }
    return event;
}

const getMyCreatedEvents = async (creatorId: string) => {
    const events = await prisma.event.findMany({
        where: {
            creatorId,
            isDeleted: false
        },
        include: {
            category: true,
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePhoto: true
                }
            }
        }
    });
    return events;
}

export const EventService = {
    createEvent,
    getAllEvents,
    getEventById,
    getMyCreatedEvents
}
