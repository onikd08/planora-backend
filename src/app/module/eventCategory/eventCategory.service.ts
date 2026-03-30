import { prisma } from "../../lib/prisma";
import {
  ICreateEventCategory,
  IUpdateEventCategory,
} from "./eventCategory.interface";

const createCategory = async (payload: ICreateEventCategory) => {
  const result = await prisma.eventCategory.create({
    data: payload,
  });
  return result;
};

const getAllCategories = async () => {
  const result = await prisma.eventCategory.findMany();
  return result;
};

const getCategoryById = async (id: string) => {
  const result = await prisma.eventCategory.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateCategory = async (id: string, payload: IUpdateEventCategory) => {
  const result = await prisma.eventCategory.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteCategory = async (id: string) => {
  const result = await prisma.eventCategory.delete({
    where: {
      id,
    },
  });
  return result;
};

export const EventCategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
