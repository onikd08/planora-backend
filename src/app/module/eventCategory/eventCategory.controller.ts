import status from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { EventCategoryService } from "./eventCategory.service";

const createCategory = catchAsync(async (req, res) => {
  const result = await EventCategoryService.createCategory(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Event category created successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await EventCategoryService.getAllCategories();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event categories fetched successfully",
    data: result,
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const result = await EventCategoryService.getCategoryById(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event category fetched successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const result = await EventCategoryService.updateCategory(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const result = await EventCategoryService.deleteCategory(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Event category deleted successfully",
    data: result,
  });
});

export const EventCategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
