import { prisma } from "../../lib/prisma";
import { ICreateEventCategory } from "./eventCategory.interface";

const createCategory = async (payload: ICreateEventCategory) => {
    const result = await prisma.eventCategory.create({
        data: payload,
    });
    return result;
}

const getAllCategories = async () => {
    const result = await prisma.eventCategory.findMany();
    return result;
}

export const EventCategoryService = {
    createCategory,
    getAllCategories
}
