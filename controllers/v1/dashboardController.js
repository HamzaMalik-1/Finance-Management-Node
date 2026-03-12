import { StatusCodes } from "http-status-codes";
import { Account, Transaction, Budget, Category } from "../../models/index.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { Op } from "sequelize";
import { sequelize } from "../../config/db.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // 1. Timeframe Calculations
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));

    // 2. Total Liquidity (Sum of all active, non-deleted accounts)
    const totalBalance = await Account.sum('balance', { 
        where: { 
            userId, 
            isActive: true,
            exclude_from_stats: false // Ensure using snake_case if model property mapping fails
        } 
    });

    // 3. Monthly Revenue & Burn (Current Month Totals)
    const cashFlow = await Transaction.findAll({
        attributes: [
            'type',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        where: {
            userId,
            transaction_date: { [Op.gte]: startOfMonth }, // ✅ Fix: use snake_case
            status: 'completed',
            is_deleted: false,                            // ✅ Fix: use snake_case
            to_account_id: { [Op.is]: null }              // ✅ Fix: use snake_case
        },
        group: ['type'],
        raw: true
    });

    // 4. 🔥 Cash Flow History (For the Recharts Intelligence Chart)
    const cashFlowHistory = await Transaction.findAll({
        attributes: [
            // ✅ Fix: use transaction_date for DATE function
            [sequelize.fn('DATE', sequelize.col('transaction_date')), 'date'],
            [
                sequelize.literal(`SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)`), 
                'amount'
            ]
        ],
        where: {
            userId,
            transaction_date: { [Op.gte]: thirtyDaysAgo }, // ✅ Fix: snake_case
            status: 'completed',
            is_deleted: false,                            // ✅ Fix: snake_case
            to_account_id: { [Op.is]: null }              // ✅ Fix: snake_case
        },
        // ✅ Fix: group by the snake_case column
        group: [sequelize.fn('DATE', sequelize.col('transaction_date'))],
        order: [[sequelize.fn('DATE', sequelize.col('transaction_date')), 'ASC']],
        raw: true
    });

    // 5. Intensity Map (Top Spending Categories)
    const topExpenses = await Transaction.findAll({
        attributes: [
            [sequelize.col('category.name'), 'categoryName'],
            [sequelize.col('category.icon'), 'icon'],
            [sequelize.col('category.color'), 'color'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        include: [{ 
            model: Category, 
            as: 'category', 
            attributes: [],
            where: { is_active: true } // ✅ Fix: snake_case
        }],
        where: { 
            userId, 
            type: 'expense', 
            status: 'completed',
            is_deleted: false          // ✅ Fix: snake_case
        },
        group: ['category.id', 'category.name', 'category.icon', 'category.color'],
        order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
        limit: 5,
        raw: true
    });

    // 6. Recent Stream (Last 5 transactions)
    const recentTransactions = await Transaction.findAll({
        where: { 
            userId, 
            is_deleted: false          // ✅ Fix: snake_case
        },
        include: [
            { model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }, 
            { model: Account, as: 'sourceAccount', attributes: ['name'] }
        ],
        // ✅ Fix: order by the actual DB column name
        order: [['transaction_date', 'DESC']],
        limit: 5
    });

    return sendResponse(res, StatusCodes.OK, "Intelligence data synchronized", {
        totalBalance: totalBalance || 0,
        cashFlow: {
            income: cashFlow.find(c => c.type === 'income')?.total || 0,
            expense: cashFlow.find(c => c.type === 'expense')?.total || 0
        },
        cashFlowHistory,   
        topExpenses,       
        recentTransactions 
    });
});