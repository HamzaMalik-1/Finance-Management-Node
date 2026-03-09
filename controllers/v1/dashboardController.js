import { StatusCodes } from "http-status-codes";
import { Account, Transaction, Budget, Category } from "../../models/index.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { Op } from "sequelize";
import { sequelize } from "../../config/db.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // 1. Total Balance across all active accounts
    const totalBalance = await Account.sum('balance', { where: { userId, isActive: true } });

    // 2. Monthly Cash Flow (Income vs Expense)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const cashFlow = await Transaction.findAll({
        attributes: [
            'type',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        where: {
            userId,
            transactionDate: { [Op.gte]: startOfMonth },
            status: 'completed'
        },
        group: ['type']
    });

    // 3. Top Spending Categories
    const topExpenses = await Transaction.findAll({
        attributes: [
            [sequelize.col('category.name'), 'categoryName'],
            [sequelize.col('category.icon'), 'icon'],
            [sequelize.col('category.color'), 'color'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        include: [{ model: Category, as: 'category', attributes: [] }],
        where: { userId, type: 'expense', status: 'completed' },
        group: ['category.id'],
        order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
        limit: 5,
        raw: true
    });

    // 4. Recent Transactions
    const recentTransactions = await Transaction.findAll({
        where: { userId },
        include: [{ model: Category, as: 'category' }, { model: Account, as: 'sourceAccount' }],
        order: [['transactionDate', 'DESC']],
        limit: 5
    });

    return sendResponse(res, StatusCodes.OK, "Dashboard data fetched", {
        totalBalance: totalBalance || 0,
        cashFlow,
        topExpenses,
        recentTransactions
    });
});