// controllers/v1/accountController.js
import { Account, AccountType, Currency, UserSettings } from '../../models/index.js';
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

    // 1. Validation
    if (!userId) {
        return sendResponse(res, StatusCodes.BAD_REQUEST, "User ID is required");
    }

    // 2. Fetch User Settings for the global currency symbol
    const userSettings = await UserSettings.findOne({
        where: { userId },
        include: [{ 
            model: Currency, 
            as: 'currency', // Matches your association alias
            attributes: ['symbol'] 
        }]
    });

    const globalCurrencySymbol = userSettings?.currency?.symbol || '$';

    // 3. Fetch Data
    const accounts = await Account.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: AccountType,
                as: 'accountType'
            },
            {
                model: Currency,
                as: 'currency' 
            }
        ]
    });

    // 4. Send Response
    // We send an object containing the list and the global symbol metadata
    return sendResponse(
        res, 
        StatusCodes.OK, 
        "Accounts fetched successfully", 
        {
            list: accounts || [],
            globalCurrencySymbol // ✅ The user's base currency symbol
        }
    );
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

// export const getAccountDetail = asyncHandler(async ( req, res)=>{
//     AccountController.paramsExist(req.params)
//     AccountController.requireFieldsInParams(req.params,['id'])
//     const {id}=req.params

//     const productDetail = await AccountController.getAllOrPaginated({

//     })
// })