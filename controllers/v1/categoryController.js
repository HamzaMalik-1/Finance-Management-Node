import { StatusCodes } from "http-status-codes";
import BaseController from "../../bases/BaseController.js";
import { Category } from "../../models/index.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";

const CategoryController = new BaseController(Category);
export const createCategory = asyncHandler(async (req, res) => {
  CategoryController.bodyExist(req.body);
  // icon and color are now required to ensure a consistent UI
  CategoryController.requireFields(req.body, ["userId", "name", "type", "icon", "color"]);

  const { userId, name, type, parentId, icon, color } = req.body;

  if (parentId) {
    await CategoryController.findOne({ id: parentId }, "errors.parent_not_found");
  }

  const category = await CategoryController.create({ 
    userId, 
    name, 
    type, 
    icon, 
    color, 
    parentId: parentId || null 
  });

  sendResponse(res, StatusCodes.CREATED, "category.created", category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  CategoryController.paramsExist(req.params);
  CategoryController.requireFieldsInParams(req.params, ["id"]);
  const { id } = req.params;
  await CategoryController.delete({ id });

  sendResponse(res, StatusCodes.OK, "category.deleted");
});

export const getAllCategories = asyncHandler(async (req, res) => {
  CategoryController.paramsExist(req.params);
  CategoryController.requireFieldsInParams(req.params, ["userId"]);

  const { userId } = req.params;

  const categories = await CategoryController.getAllOrPaginated({ userId });

  sendResponse(res, StatusCodes.OK, "category.find", categories);
});
export const getPaginatedCategories = asyncHandler(async (req, res) => {

  const { userId } = req.params;
  const {page,limit}=req.query
  const categories = await CategoryController.getAllOrPaginated(
    { userId }, 
    { paginate: true, page, limit }
  );

  sendResponse(res, StatusCodes.OK, "category.find", categories);
});



export const getCategoryTree = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const categories = await CategoryController.getAllOrPaginated(
    { 
      userId, 
      parentId: null 
    }, 
    { 
      include: [
        {
          model: Category,
          as: 'subCategories',
        }
      ],
      order: [['name', 'ASC']]
    }
  );
  sendResponse(res, StatusCodes.OK, "category.tree_found", categories);
});


// controllers/v1/categoryController.js
// controllers/v1/categoryController.js

export const updateCategory = asyncHandler(async (req, res) => {
  CategoryController.paramsExist(req.params);
  CategoryController.bodyExist(req.body);
  CategoryController.requireFieldsInParams(req.params, ["id"]);

  const { id } = req.params;
  const { name, type, icon, color, isActive } = req.body;

  // We find the record first to ensure it exists
  await CategoryController.findOne({ id }, "errors.category_not_found");

  const updatedCategory = await CategoryController.update(
    { id }, 
    { name, type, icon, color, isActive }
  );

  sendResponse(res, StatusCodes.OK, "category.updated", updatedCategory);
});