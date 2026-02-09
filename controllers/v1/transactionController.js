import { StatusCodes } from "http-status-codes";
import { Transaction } from "../../models/index.js";
import {sequelize} from "../../config/db.js"
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import BaseController from "../../bases/BaseController.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { checkBudgetThreshold } from "../../utils/FinanceHelpers/BudgetChecker.js"; // Ensure this helper exists
import { BadRequestError, NotFoundError } from "../../utils/ErrorHelpers/Errors.js";

const TransactionController = new BaseController(Transaction);

/**
 * 1. Create Transaction
 * Automatically triggers the 'afterCreate' hook for balance management
 */
export const createTransaction = asyncHandler(async (req, res) => {
    // Basic validations using BaseController
    TransactionController.bodyExist(req.body);
    TransactionController.requireFields(req.body, ["userId", "accountId", "amount", "type"]);

    const { userId, categoryId, type } = req.body;

    // Use the base create method
    const transaction = await TransactionController.create(req.body);

    // If it's an expense, check the budget threshold to trigger notifications
    if (type === 'expense' && categoryId) {
        await checkBudgetThreshold(userId, categoryId, transaction);
    }

    return sendResponse(res, StatusCodes.CREATED, "Transaction recorded successfully", transaction);
});

/**
 * 2. Change Transaction Status
 * Atomic update that triggers the 'afterUpdate' hook for balance correction
 */
export const changeTransactionStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status input
    const allowedStatuses = ['pending', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
        throw new BadRequestError("errors.invalid_status");
    }

    // Use a managed transaction to ensure balance hooks and status update are atomic
    const updatedTransaction = await sequelize.transaction(async (t) => {
        // Find existing transaction within the database transaction
        const transaction = await TransactionController.find({ id }, [], { transaction: t });
        
        if (!transaction) {
            throw new NotFoundError("errors.transaction_not_found");
        }

        // Update the status
        transaction.status = status;
        await transaction.save({ transaction: t });
        
        return transaction;
    });

    return sendResponse(res, StatusCodes.OK, `Transaction status changed to ${status}`, updatedTransaction);
});

/**
 * 3. Get User Transactions (Paginated)
 */
export const getUserTransactions = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const transactions = await TransactionController.getAllOrPaginated(
        { userId },
        { 
            paginate: true, 
            page, 
            limit,
            // Include related models for a better frontend view
            include: ['Category', 'Account'] 
        }
    );

    return sendResponse(res, StatusCodes.OK, "Transactions fetched successfully", transactions);
});