// controllers/v1/accountController.js
import {
  Account,
  AccountType,
  Category,
  Currency,
  Transaction,
} from "../../models/index.js";
import BaseController from "../../bases/BaseController.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const AccountController = new BaseController(Account);

/**
 * Create a new account
 * Sets balance equal to openingBalance initially
 */
export const createAccount = asyncHandler(async (req, res) => {
  AccountController.bodyExist(req.body);
  AccountController.requireFields(req.body, [
    "userId",
    "name",
    "accountTypeId",
    "currencyId",
  ]);

  const { userId, name, accountTypeId, currencyId, openingBalance } = req.body;

  // In a new account, the current balance starts as the opening balance
  const data = {
    userId,
    name,
    accountTypeId,
    currencyId,
    openingBalance: openingBalance || 0,
    balance: openingBalance || 0,
  };

  const newAccount = await AccountController.create(data);
  return sendResponse(
    res,
    StatusCodes.CREATED,
    "Account created successfully",
    newAccount,
  );
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

  // 2. Fetch Data (Ensure you 'await' the result)
  const accounts = await Account.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: AccountType, // ✅ Include the related model
        as: "accountType", // ✅ Must match the 'as' in your association
      },
      {
        model: Currency, // ✅ If you want to include currency too
        as: "currency",
      },
    ],
  });
  // 3. Conditional Check (Optional: helps if you want to distinguish empty from error)
  if (!accounts || accounts.length === 0) {
    return sendResponse(
      res,
      StatusCodes.OK,
      "No accounts found for this user",
      [],
    );
  }

  // 4. Send Response (Pass the 'accounts' array into the data field)
  return sendResponse(
    res,
    StatusCodes.OK,
    "Accounts fetched successfully",
    accounts, // ✅ This ensures "data" is not null
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

// controllers/v1/accountController.js
export const getAccountDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Fetch Account
  const account = await Account.findByPk(id, {
    include: [
      { model: AccountType, as: "accountType" },
      { model: Currency, as: "currency" },
    ],
  });

  if (!account) {
    return sendResponse(res, StatusCodes.NOT_FOUND, "Account not found");
  }

  // 2. Fetch Recent Audit History
  const transactions = await Transaction.findAll({
    where: { accountId: id },
    include: [
      {
        model: Category,
        as: "category", // ✅ Ensure this matches your association alias
        attributes: ["id", "name", "icon", "color"], // Optimized: only fetch what you need
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: 20,
  });

  // 3. Calculate Ledger Stats
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const data = {
    ...account.get({ plain: true }),
    history: transactions,
    stats: {
      income,
      expense,
      netFlow: income - expense,
    },
  };

  return sendResponse(res, StatusCodes.OK, "Account details fetched", data);
});
