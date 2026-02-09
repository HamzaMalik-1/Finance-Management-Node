import { Budget, Category, Currency,User } from "../../models/index.js";
import BaseController from "../../bases/BaseController.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const BudgetController = new BaseController(Budget);
const UserController = new BaseController(User);

/**
 * 1. Create Budget
 */
export const createBudget = asyncHandler(async (req, res) => {
    BudgetController.bodyExist(req.body);
    // Required fields based on your schema
    BudgetController.requireFields(req.body, ["userId", "categoryId", "amountLimit", "currencyId", "startDate", "endDate"]);

    const { userId, categoryId, startDate, endDate } = req.body;
   await UserController.findOne({ id: userId }, "errors.user_not_found");
    // Optional: Check if a budget already exists for this category in this date range
    // await BudgetController.alreadyExist({ userId, categoryId, isActive: true });

    const newBudget = await BudgetController.create(req.body);
    return sendResponse(res, StatusCodes.CREATED, "Budget created successfully", newBudget);
});

/**
 * 2. Get User Budgets
 * Includes Category and Currency info for the Next.js progress bars
 */
export const getUserBudgets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const budgets = await BudgetController.getAllOrPaginated(
        { userId, isActive: true },
        {
            include: [
                { model: Category, as: 'category', attributes: ['name', 'icon', 'color'] },
                { model: Currency, as: 'currency', attributes: ['code', 'symbol'] }
            ],
            order: [['endDate', 'ASC']]
        }
    );

    return sendResponse(res, StatusCodes.OK, "Budgets fetched successfully", budgets);
});

/**
 * 3. Update Budget
 * Useful for changing amountLimit or alertThreshold
 */
export const updateBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Using the update logic from your BaseController
    const updatedBudget = await BudgetController.update({ id }, req.body);
    
    return sendResponse(res, StatusCodes.OK, "Budget updated successfully", updatedBudget);
});

/**
 * 4. Delete Budget (Soft Delete)
 */
export const deleteBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await BudgetController.softDelete({ id });
    return sendResponse(res, StatusCodes.OK, "Budget removed successfully");
});