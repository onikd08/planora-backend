import { prisma } from "../../lib/prisma";
import { ICreateEvent } from "./event.interface";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { EventSearchableFields, EVENT_STATUS } from "./event.constants";

const createEvent = async (creatorId: string, payload: ICreateEvent) => {
  const { startTime, endTime, ...rest } = payload;

  // check start time < end time
  const startTimeDate = new Date(startTime);
  const endTimeDate = new Date(endTime);

  if (startTimeDate >= endTimeDate) {
    throw new AppError(
      status.BAD_REQUEST,
      "Start time must be before end time",
    );
  }

  const event = await prisma.event.create({
    data: {
      ...rest,
      startTime: startTimeDate,
      endTime: endTimeDate,
      creatorId,
    },
    include: {
      category: true,
      creator: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });
  return event;
};

const getAllEvents = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = query.searchTerm as string | undefined;
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as "asc" | "desc") || "desc";

  // Build where clauses
  const whereConditions: Prisma.EventWhereInput[] = [];

  // Search functionality
  if (searchTerm) {
    whereConditions.push({
      OR: [
        ...EventSearchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive" as Prisma.QueryMode,
          },
        })),
        {
          category: {
            name: {
              contains: searchTerm,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        },
        {
          creator: {
            OR: [
              {
                firstName: {
                  contains: searchTerm,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                lastName: {
                  contains: searchTerm,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                email: {
                  contains: searchTerm,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
            ],
          },
        },
      ],
    });
  }

  // Filter by other fields
  const excludeFields = [
    "searchTerm",
    "page",
    "limit",
    "sortBy",
    "sortOrder",
    "fields",
  ];
  const filterData = Object.fromEntries(
    Object.entries(query).filter(([key]) => !excludeFields.includes(key)),
  );

  if (Object.keys(filterData).length > 0) {
    const formattedFilterData: Record<string, unknown> = {};
    const feeFilter: Prisma.FloatFilter = {};

    for (const [key, value] of Object.entries(filterData)) {
      if (key === "capacity") {
        formattedFilterData[key] = Number(value);
      } else if (key === "fee") {
        feeFilter.equals = Number(value);
      } else if (key === "minFee") {
        feeFilter.gte = Number(value);
      } else if (key === "maxFee") {
        feeFilter.lte = Number(value);
      } else if (key === "type") {
        if (value === "paid") feeFilter.gt = 0;
        else if (value === "free") feeFilter.equals = 0;
      } else if (key === "eventStatus") {
        const now = new Date();
        if (value === EVENT_STATUS.UPCOMING) {
          formattedFilterData["startTime"] = { gt: now };
          formattedFilterData["isCancelled"] = false;
        } else if (value === EVENT_STATUS.ONGOING) {
          formattedFilterData["startTime"] = { lte: now };
          formattedFilterData["endTime"] = { gte: now };
          formattedFilterData["isCancelled"] = false;
        } else if (value === EVENT_STATUS.COMPLETED) {
          formattedFilterData["endTime"] = { lt: now };
          formattedFilterData["isCancelled"] = false;
        } else if (value === EVENT_STATUS.CANCELLED) {
          formattedFilterData["isCancelled"] = true;
        }
      } else if (["isFeatured", "isDeleted"].includes(key)) {
        formattedFilterData[key] = value === "true";
      } else if (["startTime", "endTime"].includes(key)) {
        formattedFilterData[key] = new Date(value as string);
      } else if (key === "category") {
        formattedFilterData[key] = {
          name: { contains: value as string, mode: "insensitive" },
        };
      } else if (
        key === "title" ||
        key === "description" ||
        key === "address" ||
        key === "country" ||
        key === "city"
      ) {
        formattedFilterData[key] = {
          contains: value as string,
          mode: "insensitive",
        };
      } else if (key === "creator") {
        formattedFilterData[key] = {
          OR: [
            {
              firstName: {
                contains: value as string,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: value as string,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: value as string,
                mode: "insensitive",
              },
            },
          ],
        };
      } else {
        formattedFilterData[key] = value;
      }
    }

    if (Object.keys(feeFilter).length > 0) {
      formattedFilterData["fee"] = feeFilter;
    }

    whereConditions.push(formattedFilterData as Prisma.EventWhereInput);
  }

  const whereClause: Prisma.EventWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Execute query
  const [result, total] = await Promise.all([
    prisma.event.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    }),
    prisma.event.count({ where: whereClause }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePhoto: true,
        },
      },
      reviews: true,
      eventParticipations: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              profilePhoto: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }
  return event;
};

const getMyCreatedEvents = async (creatorId: string) => {
  const events = await prisma.event.findMany({
    where: {
      creatorId,
      isDeleted: false,
    },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });
  return events;
};

const makeEventFeatured = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      category: true,
      creator: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  const result = await prisma.event.update({
    where: {
      id,
    },
    data: {
      isFeatured: !event.isFeatured,
    },
  });
  return result;
};

export const EventService = {
  createEvent,
  getAllEvents,
  getEventById,
  getMyCreatedEvents,
  makeEventFeatured,
};
