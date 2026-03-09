import { Debt, Contact, Account, Transaction } from "../../models/index.js";
import BaseController from "../../bases/BaseController.js";
import asyncHandler from "../../utils/AsyncHelper/Async.js";
import sendResponse from "../../utils/ResponseHelpers/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../config/db.js";
import { BadRequestError } from "../../utils/ErrorHelpers/Errors.js"; // Ensure this is imported
import { Op } from "sequelize";

const DebtController = new BaseController(Debt);
const ContactController = new BaseController(Contact);


export const addRepayment = asyncHandler(async (req, res) => {
    const { id } = req.params; // Debt ID from URL
    const { amount, accountId, note, userId } = req.body;

    // 1. Basic validation
    if (!amount || parseFloat(amount) <= 0) {
        throw new BadRequestError("Please provide a valid repayment amount.");
    }

    const result = await sequelize.transaction(async (t) => {
        // 2. Fetch the debt record with a lock to prevent race conditions
        const debt = await Debt.findByPk(id, { transaction: t, lock: true });
        if (!debt) {
            throw new BadRequestError("Debt record not found.");
        }

        const paymentAmount = parseFloat(amount);
        const currentRemaining = parseFloat(debt.remainingAmount);

        // 🛑 OVERPAYMENT CHECK:
        if (paymentAmount > currentRemaining) {
            throw new BadRequestError(
                `Overpayment detected. You are trying to pay $${paymentAmount}, but the remaining balance is only $${currentRemaining}.`
            );
        }

        // 3. Determine Ledger Transaction Type
        // I Lent (Money coming back to me) -> Income
        // I Borrowed (Money leaving me) -> Expense
        const transactionType = debt.type === 'lent' ? 'income' : 'expense';

        // 4. Create the Ledger Entry
        await Transaction.create({
            userId,
            accountId,
            debtId: debt.id,
            amount: paymentAmount,
            type: transactionType,
            description: note || `Repayment for ${debt.type} debt`,
            transactionDate: new Date(),
            status: 'completed'
        }, { transaction: t });

        // 5. Update Debt Balance
        // This triggers the 'beforeSave' hook in your model to update the status
        debt.remainingAmount = currentRemaining - paymentAmount;
        
        await debt.save({ transaction: t });

        return debt;
    });

    return sendResponse(res, StatusCodes.OK, "Repayment recorded successfully", result);
});
// controllers/v1/deptController.js

export const createDebt = asyncHandler(async (req, res) => {
    DebtController.bodyExist(req.body);
    
    if (!req.body.contactId && !req.body.contactName) {
        throw new BadRequestError("Please provide either a contactId or a contactName.");
    }

    DebtController.requireFields(req.body, ["userId", "accountId", "amount", "type"]);

    const { userId, contactId, contactName, phoneNumber, amount } = req.body;

    const newDebt = await sequelize.transaction(async (t) => {
        let finalContactId = contactId;

        // Create contact if it doesn't exist
        if (!finalContactId) {
            const newContact = await ContactController.create({
                userId,
                name: contactName,
                phoneNumber: phoneNumber || null,
            }, { transaction: t });
            
            finalContactId = newContact.id;
        }

        const debtData = {
            ...req.body,
            contactId: finalContactId,
            amount: parseFloat(amount),
            remainingAmount: parseFloat(amount)
        };

        // We use the raw model create here to ensure hooks trigger predictably
        const createdDebt = await Debt.create(debtData, { transaction: t });
        
        return await Debt.findByPk(createdDebt.id, {
            include: [
                { model: Contact, as: 'contactPerson' },
                { model: Account, as: 'account' }
            ],
            transaction: t
        });
    });

    return sendResponse(res, StatusCodes.CREATED, "debt.created_success", newDebt);
});

export const getUserDebts = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const debts = await Debt.findAll({
        where: { userId },
        include: [
            { model: Contact, as: 'contactPerson' }, // Check model/index.js for this alias
            { model: Account, as: 'account' }
        ],
        order: [['createdAt', 'DESC']]
    });

    const detailedDebts = debts.map(debt => {
        const d = debt.get({ plain: true }); // Cleaner way to get plain object
        const principal = parseFloat(d.amount || 0);
        const rate = parseFloat(d.interestRate || 0);
        const remaining = parseFloat(d.remainingAmount || 0);
        
        // Simple interest calculation
        const interest = (principal * rate) / 100; 
        const totalObligation = principal + interest;

        return {
            ...d,
            interestAmount: interest,
            totalObligation: totalObligation,
            // logic: Total minus what has already been paid off the principal
            remainingWithInterest: totalObligation - (principal - remaining)
        };
    });

    return sendResponse(res, StatusCodes.OK, "debt.fetched_success", detailedDebts);
});

export const getDebtSummary = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const summary = await Debt.findAll({
        where: { 
            userId, 
            status: ['active', 'settled'] 
        },
        attributes: [
            'type',
            [
                sequelize.fn('COALESCE', 
                    // Change 'remaining_amount' to 'amount' to see the total recorded value
                    sequelize.fn('SUM', sequelize.cast(sequelize.col('amount'), 'DECIMAL')), 
                    0
                ), 
                'totalAmount'
            ]
        ],
        group: ['type'],
        raw: true
    });

    return sendResponse(res, StatusCodes.OK, "debt.summary_success", summary || []);
});

// Add getDebtDetails to your exports in deptController.js

export const getDebtDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

 const debt = await Debt.findByPk(id, {
    include: [
        { model: Contact, as: 'contactPerson' },
        { 
            model: Transaction, 
            as: 'repayments',
            where: { 
                // 🛑 FILTER: Don't show the 'Initial entry' in the payment timeline
                description: { [Op.notLike]: '%Initial entry%' } 
            },
            required: false, // Don't hide the debt if there are no payments yet
            include: [{ model: Account, as: 'sourceAccount' }] 
        }
    ]
});

    if (!debt) {
        return sendResponse(res, StatusCodes.NOT_FOUND, "debt.not_found");
    }

    // Apply the same math logic as getUserDebts
    const d = debt.get({ plain: true });
    const principal = parseFloat(d.amount || 0);
    const rate = parseFloat(d.interestRate || 0);
    const remaining = parseFloat(d.remainingAmount || 0);
    
    const interest = (principal * rate) / 100; 
    const totalObligation = principal + interest;

    const detailedDebt = {
        ...d,
        interestAmount: interest,
        totalObligation: totalObligation,
        remainingWithInterest: totalObligation - (principal - remaining)
    };

    return sendResponse(res, StatusCodes.OK, "debt.details_fetched", detailedDebt);
});