import { prisma } from "../../lib/prisma";
import { ICreateEvent } from "./event.interface";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const createEvent = async (creatorId: string, payload: ICreateEvent) => {
    const {startTime, endTime, ...rest} = payload;

    // check start time < end time
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    if (startTimeDate >= endTimeDate) {
        throw new AppError(status.BAD_REQUEST, "Start time must be before end time");
    }
    
    const event = await prisma.event.create({
        data: {
            ...rest,
            startTime: startTimeDate,
            endTime: endTimeDate,
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
