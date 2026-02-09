// controllers/v1/accountController.js
import { Account, AccountType, Currency } from '../../models/index.js';
import BaseController from '../../bases/BaseController.js';
import asyncHandler from '../../utils/AsyncHelper/Async.js';
import sendResponse from '../../utils/ResponseHelpers/sendResponse.js';
import { StatusCodes } from 'http-status-codes';

const AccountController = new BaseController(Account);

/**
 * Create a new account
 * Sets balance equal to openingBalance initially
 */
export const createAccount = asyncHandler(async (req, res) => {
    AccountController.bodyExist(req.body);
    AccountController.requireFields(req.body, ["userId", "name", "accountTypeId", "currencyId"]);

    const { userId, name, accountTypeId, currencyId, openingBalance } = req.body;

    // In a new account, the current balance starts as the opening balance
    const data = {
        userId,
        name,
        accountTypeId,
        currencyId,
        openingBalance: openingBalance || 0,
        balance: openingBalance || 0 
    };

    const newAccount = await AccountController.create(data);
    return sendResponse(res, StatusCodes.CREATED, "Account created successfully", newAccount);
});

/**
 * Get all accounts for a specific user
 * Includes AccountType and Currency details for the frontend
 */
export const getUserAccounts = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const accounts = await AccountController.getAllOrPaginated(
        { userId }, 
        { attributes: ['id', 'name', 'balance', 'openingBalance', 'isActive'],
            include: [
                { 
                    model: AccountType, 
                    as: 'accountType', // 👈 Change this to match your model association alias
                    attributes: ['name', 'slug'] 
                },
                { 
                    model: Currency, 
                    as: 'currency', // 👈 Change this to match your model association alias
                    attributes: ['code', 'symbol'] 
                }
            ] 
        }
    );

    return sendResponse(res, StatusCodes.OK, "Accounts fetched successfully", accounts);
});

/**
 * Update Account details (Name, isActive, etc.)
 */
export const updateAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // We don't usually allow updating 'balance' directly here; 
    // that should happen via Transactions.
    const updatedAccount = await AccountController.update({ id }, req.body);
    return sendResponse(res, StatusCodes.OK, "Account updated", updatedAccount);
});

/**
 * Soft Delete Account
 */
export const deleteAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await AccountController.softDelete({ id });
    return sendResponse(res, StatusCodes.OK, "Account deleted successfully");
});