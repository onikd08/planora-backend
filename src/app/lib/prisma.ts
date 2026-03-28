import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { EVENT_STATUS, TEventStatus } from "../module/event/event.constants";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const basePrisma = new PrismaClient({ adapter });

const prisma = basePrisma.$extends({
  result: {
    event: {
      eventStatus: {
        needs: { startTime: true, endTime: true, isCancelled: true },
        compute(event): TEventStatus {
          if (event.isCancelled) return EVENT_STATUS.CANCELLED;
          const now = new Date();
          if (now < event.startTime) return EVENT_STATUS.UPCOMING;
          if (now >= event.endTime) return EVENT_STATUS.COMPLETED;
          return EVENT_STATUS.ONGOING;
        },
      },
    },
  },
});

export { prisma };
